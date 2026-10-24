/**
 * SM-2 tabanlı aralıklı tekrar.
 * grade: 0 = Tekrar (bilemedim), 1 = Zor, 2 = İyi, 3 = Kolay
 */
export interface SrsState {
  ease: number;
  interval: number; // gün
  reps: number;
  lapses: number;
}

export function schedule(state: SrsState, grade: 0 | 1 | 2 | 3) {
  let { ease, interval, reps, lapses } = state;
  const now = new Date();

  if (grade === 0) {
    lapses += 1;
    reps = 0;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    // 10 dakika sonra tekrar göster
    return { ease, interval, reps, lapses, due: new Date(now.getTime() + 10 * 60 * 1000) };
  }

  if (reps === 0) {
    interval = grade === 1 ? 1 : grade === 2 ? 1 : 3;
  } else if (reps === 1) {
    interval = grade === 1 ? 2 : grade === 2 ? 3 : 6;
  } else {
    const factor = grade === 1 ? 1.2 : grade === 2 ? ease : ease * 1.3;
    interval = Math.max(interval + 1, Math.round(interval * factor));
  }

  ease = Math.max(1.3, ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0));
  reps += 1;

  const due = new Date(now);
  due.setDate(due.getDate() + interval);
  due.setHours(4, 0, 0, 0); // gün başında hazır olsun
  return { ease, interval, reps, lapses, due };
}

/** Butonlarda gösterilecek tahmini aralık */
export function previewInterval(state: SrsState, grade: 0 | 1 | 2 | 3) {
  if (grade === 0) return "10 dk";
  const { interval } = schedule(state, grade);
  if (interval < 30) return `${interval} g`;
  if (interval < 365) return `${Math.round(interval / 30)} ay`;
  return `${(interval / 365).toFixed(1)} yıl`;
}
