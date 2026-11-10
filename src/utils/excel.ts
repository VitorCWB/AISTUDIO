import * as XLSX from 'xlsx';
import { PedidoBase } from '../types';

function parseNumeroBR(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val)
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function getCampoFuzzy(rowObj: Record<string, unknown>, aliases: string[]): unknown {
  const keys = Object.keys(rowObj);
  for (const alias of aliases) {
    const aliasLower = alias.trim().toLowerCase();
    for (const key of keys) {
      const keyLower = key.trim().toLowerCase();
      if (keyLower === aliasLower || keyLower.startsWith(aliasLower)) {
        return rowObj[key];
      }
    }
  }
  return '';
}

export async function processarArquivoExcel(file: File): Promise<PedidoBase[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Procurar por aba "4-Pedidos" ou variação, senão usar a primeira aba
  const targetSheetName =
    workbook.SheetNames.find((name) => {
      const clean = name.trim().toLowerCase();
      return clean.includes('4-pedidos') || clean.includes('pedidos') || clean.includes('4 - pedidos');
    }) || workbook.SheetNames[0];

  const sheet = workbook.Sheets[targetSheetName];
  if (!sheet) {
    throw new Error(`Aba de pedidos não encontrada no arquivo ${file.name}`);
  }

  const rawMatrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
  if (!rawMatrix || rawMatrix.length === 0) {
    throw new Error('A planilha está vazia ou sem dados legíveis.');
  }

  // Localizar linha de cabeçalho
  let headerIndex = rawMatrix.findIndex(
    (row) => Array.isArray(row) && row.some((col) => String(col || '').toLowerCase().includes('pedido'))
  );
  if (headerIndex === -1) headerIndex = 0;

  const headerRow = (rawMatrix[headerIndex] as unknown[]).map((h) => String(h || '').trim());
  const listaPedidos: PedidoBase[] = [];

  for (let i = headerIndex + 1; i < rawMatrix.length; i++) {
    const row = rawMatrix[i] as unknown[];
    if (!row || row.length === 0) continue;

    const rowObj: Record<string, unknown> = {};
    headerRow.forEach((colName, colIdx) => {
      if (colName) rowObj[colName] = row[colIdx] !== undefined ? row[colIdx] : '';
    });

    const rawPedido = getCampoFuzzy(rowObj, ['pedido', 'nº pedido', 'num pedido', 'nr pedido']);
    const numPedido = String(rawPedido || '').replace(/\.0$/, '').trim();

    if (numPedido) {
      const rawMalote = getCampoFuzzy(rowObj, ['malote', 'nº malote', 'nr malote', 'num malote']);
      const malote = String(rawMalote || '').replace(/\.0$/, '').trim();

      const rawCliente = getCampoFuzzy(rowObj, ['cliente', 'paciente', 'destinatario', 'nome']);
      const cliente = String(rawCliente || 'Cliente Não Informado').trim();

      const rawTransp = getCampoFuzzy(rowObj, ['transportadora', 'transp', 'envio']);
      const transportadora = String(rawTransp || 'TRANSPORTADORA').trim().toUpperCase();

      const rawProduto = getCampoFuzzy(rowObj, ['produto', 'item', 'descricao']);
      const produto = String(rawProduto || '').trim();

      const rawTotal = getCampoFuzzy(rowObj, ['total', 'preco venda', 'valor', 'vlr total', 'total pedido']);
      const total = parseNumeroBR(rawTotal);

      const rawFrete = getCampoFuzzy(rowObj, ['frete', 'vlr frete', 'valor frete']);
      const frete = parseNumeroBR(rawFrete);

      const rawEstado = getCampoFuzzy(rowObj, ['estado', 'uf']);
      const estado = String(rawEstado || '').trim().toUpperCase();

      const rawVendedor = getCampoFuzzy(rowObj, [
        'vendedor',
        'nome vendedor',
        'nome do vendedor',
        'repr',
        'representante',
        'consultor',
        'atendente',
        'rep',
      ]);
      const vendedor = String(rawVendedor || '').trim();

      listaPedidos.push({
        pedido: numPedido,
        malote: malote || undefined,
        buscaKey: `${numPedido} ${malote} ${vendedor}`.trim().toLowerCase(),
        cliente,
        transportadora,
        produto: produto || undefined,
        total,
        frete,
        estado: estado || undefined,
        vendedor: vendedor || undefined,
      });
    }
  }

  return listaPedidos;
}
