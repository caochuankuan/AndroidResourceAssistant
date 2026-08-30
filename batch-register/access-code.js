'use strict';

(function exposeDailyAccessCode(global) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  function getChinaDateParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    return Object.fromEntries(parts.map(part => [part.type, part.value]));
  }

  function getDailyAccessCode(date = new Date()) {
    const values = getChinaDateParts(date);
    const source = `BATCH@${values.year}${values.month}${values.day}#YJ-ACCESS`;
    let state = 0x811c9dc5;

    for (const character of source) {
      state = Math.imul(state ^ character.charCodeAt(0), 0x01000193) >>> 0;
    }

    let code = '';
    for (let index = 0; index < 8; index += 1) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      code += alphabet[state % alphabet.length];
    }
    return code;
  }

  global.getChinaDateParts = getChinaDateParts;
  global.getDailyAccessCode = getDailyAccessCode;
}(globalThis));
