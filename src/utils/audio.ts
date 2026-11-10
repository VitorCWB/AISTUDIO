/**
 * Sintetizador Web Audio API para simulação de leitor de código de barras
 * Bip agudo para leitura com sucesso, tom grave para erro ou alerta
 */
export function tocarBeep(sucesso = true) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = sucesso ? 'sine' : 'sawtooth';
    osc.frequency.value = sucesso ? 880 : 280;

    const startTime = ctx.currentTime;
    const duration = sucesso ? 0.14 : 0.32;

    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch {
    // Silently continue if audio context is blocked by browser policy
  }
}
