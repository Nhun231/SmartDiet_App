export const generateSchedule = (wakeUpTime, sleepTime, intervalMinutes) => {
    const result = [];
    const [wakeH, wakeM] = wakeUpTime.split(':').map(Number);
    const [sleepH, sleepM] = sleepTime.split(':').map(Number);

    const wakeTotalMin = wakeH * 60 + wakeM;
    const sleepTotalMin = sleepH * 60 + sleepM;

    let current = wakeTotalMin + 5; // thêm 5 phút sau khi dậy

    while (current < sleepTotalMin) {
        const h = Math.floor(current / 60).toString().padStart(2, '0');
        const m = (current % 60).toString().padStart(2, '0');
        result.push({ time: `${h}:${m}`, amount: '250ml' });
        current += intervalMinutes;
    }

    return result;
};
