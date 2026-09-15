import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import { indexMembers, resolveParticipants, activitiesForMember } from "./activity-members.mjs";
import { sortMembers } from "./member-sort";

type OrderedEntry = { data: { order: number } };

const byOrder = <T extends OrderedEntry>(a: T, b: T) =>
  a.data.order - b.data.order;

type PageEntry = CollectionEntry<"pages">;
type PageData = PageEntry["data"];
type PageId = PageData["page"];
type PageEntryFor<T extends PageId> = Omit<PageEntry, "data"> & {
  data: Extract<PageData, { page: T }>;
};

export async function getSiteContent(): Promise<CollectionEntry<"site">> {
  const content = await getEntry("site", "global");

  if (!content) {
    throw new Error("src/content/site/global.md 파일이 필요합니다.");
  }

  return content;
}

export async function getPageContent<T extends PageId>(
  page: T,
): Promise<PageEntryFor<T>> {
  const content = await getEntry("pages", page);

  if (!content) {
    throw new Error(`src/content/pages/${page}.md 파일이 필요합니다.`);
  }

  if (content.data.page !== page) {
    throw new Error(
      `src/content/pages/${page}.md의 page 값은 "${page}"이어야 합니다.`,
    );
  }

  return content as PageEntryFor<T>;
}

export type ActivityKind = "research" | "projects";
export type Activity = CollectionEntry<ActivityKind> & { participants: CollectionEntry<"members">[] };

export async function getActivities(kind: ActivityKind): Promise<Activity[]> {
  const [entries, members] = await Promise.all([getCollection(kind), getMembers()]);
  const index = indexMembers(members);
  return entries.sort(byOrder).map((entry) => ({
    ...entry,
    participants: resolveParticipants(entry.data.members, index, `${kind}/${entry.id}.md`),
  }));
}

export const getResearch = () => getActivities("research");
export const getProjects = () => getActivities("projects");

export async function getFeaturedActivities(kind: ActivityKind) {
  return (await getActivities(kind)).filter(({ data }) => data.featured);
}

export async function getMemberActivities(memberId: string) {
  const [research, projects] = await Promise.all([getResearch(), getProjects()]);
  return activitiesForMember([...research, ...projects], memberId);
}

export async function getMembers() {
  const entries = await getCollection("members");
  return sortMembers(entries);
}
