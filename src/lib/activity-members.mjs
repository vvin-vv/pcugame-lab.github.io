/** @template {{id: string, data: {name: string}}} T
 * @param {T[]} members
 * @returns {Map<string, T>}
 */
export function indexMembers(members) {
  const index = new Map();
  for (const member of members) {
    const name = member.data.name.trim();
    if (index.has(name)) throw new Error(`members/${member.id}: 구성원 이름 "${name}"이(가) 중복됩니다.`);
    index.set(name, member);
  }
  return index;
}

/** @template T
 * @param {unknown} names
 * @param {Map<string, T>} index
 * @param {string} source
 * @returns {T[]}
 */
export function resolveParticipants(names, index, source) {
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error(`${source}: members에는 참여자 이름이 한 개 이상 필요합니다.`);
  }
  const seen = new Set();
  return names.map((value) => {
    const name = typeof value === 'string' ? value.trim() : '';
    if (!name || !index.has(name)) throw new Error(`${source}: 등록되지 않은 참여자 ${JSON.stringify(value)}입니다.`);
    if (seen.has(name)) throw new Error(`${source}: 참여자 "${name}"이(가) 중복됩니다.`);
    seen.add(name);
    return /** @type {T} */ (index.get(name));
  });
}

/** @template {{collection: string, participants: {id: string}[]}} T
 * @param {T[]} activities
 * @param {string} memberId
 */
export function activitiesForMember(activities, memberId) {
  const own = activities.filter((activity) => activity.participants.some(({id}) => id === memberId));
  return {
    research: own.filter(({collection}) => collection === 'research'),
    projects: own.filter(({collection}) => collection === 'projects'),
  };
}
