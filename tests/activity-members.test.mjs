import test from 'node:test';
import assert from 'node:assert/strict';
import { indexMembers, resolveParticipants, activitiesForMember } from '../src/lib/activity-members.mjs';

const members = [
  {id: '21-jaekyu-park', data: {name: '박재규'}},
  {id: 'song-jihan', data: {name: '송지한'}},
];
const index = indexMembers(members);

test('이름을 구성원 ID로 연결하고 입력 순서와 공백 정규화를 유지한다', () => {
  assert.deepEqual(resolveParticipants([' 송지한 ', '박재규'], index, 'research/test.md'), [members[1], members[0]]);
});

test('미등록·중복·빈 참여자 명단을 파일명과 함께 보고한다', () => {
  for (const names of [undefined, [], [''], [null], ['없는 이름'], ['박재규', ' 박재규 ']]) {
    assert.throws(() => resolveParticipants(names, index, 'research/test.md'), /research\/test.md:/);
  }
  assert.throws(() => resolveParticipants(['없는 이름'], index, 'projects/test.md'), /없는 이름/);
});

test('이름이 중복된 구성원은 임의로 선택하지 않는다', () => {
  assert.throws(() => indexMembers([...members, {id: 'another', data: {name: ' 박재규 '}}]), /박재규.*중복/);
});

test('공동 참여 이력을 유형별로 분리하고 동일한 slug도 독립적으로 처리한다', () => {
  const research = {id: 'same', collection: 'research', participants: members};
  const project = {id: 'same', collection: 'projects', participants: [members[0]]};
  const activities = [research, project];
  assert.deepEqual(activitiesForMember(activities, members[0].id), {research: [research], projects: [project]});
  assert.deepEqual(activitiesForMember(activities, members[1].id), {research: [research], projects: []});
  assert.deepEqual(activitiesForMember(activities, 'unknown'), {research: [], projects: []});
});
