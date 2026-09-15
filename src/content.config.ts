import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const text = z.string().trim().min(1, "비어 있지 않은 문자열이 필요합니다.");
const internalPath = text.regex(
  /^\/(?:[a-z0-9-]+\/)*$/,
  "내부 경로는 / 또는 /research/ 같은 형식이어야 합니다.",
);

const seoSchema = z.strictObject({
  title: text,
  description: text,
});

const heroLineSchema = z.strictObject({
  word: text,
  suffix: z.string().trim().default(""),
  annotation: z.string().trim().default(""),
});

const pageHeroSchema = z.strictObject({
  lines: z.array(heroLineSchema).min(1),
  metaPrimary: text,
  metaSecondary: text,
  titleEn: text,
  description: text,
});

const principleSchema = z.strictObject({
  title: text,
  label: text,
  description: text,
});

const factSchema = z.strictObject({
  label: text,
  value: text,
});

const site = defineCollection({
  loader: glob({ pattern: "global.md", base: "./src/content/site" }),
  schema: z.strictObject({
    site: z.strictObject({
      name: text,
      shortName: text,
      title: text,
      description: text,
      url: z.url(),
      github: z.url(),
      navigation: z
        .array(
          z.strictObject({
            href: internalPath,
            label: text,
            index: text,
          }),
        )
        .min(1)
        .refine(
          (items) => new Set(items.map(({ href }) => href)).size === items.length,
          "내비게이션 경로를 중복해서 지정할 수 없습니다.",
        ),
    }),
    header: z.strictObject({
      brandLines: z.array(text).length(2),
      brandAriaLabel: text,
      desktopNavAriaLabel: text,
      menuLabel: text,
      menuOpenAriaLabel: text,
      mobileNavAriaLabel: text,
    }),
    footer: z.strictObject({
      eyebrow: text,
      titleLines: z.array(text).length(2),
      navigationLabel: text,
      connectLabel: text,
      githubLabel: text,
      copyrightTemplate: text.refine(
        (value) => value.includes("{year}") && value.includes("{shortName}"),
        "저작권 문구에는 {year}와 {shortName}이 모두 필요합니다.",
      ),
      tagline: text,
      backToTopLabel: text,
      backToTopAriaLabel: text,
    }),
    accessibility: z.strictObject({
      skipLinkLabel: text,
      memberInterestsLabel: text,
      memberInterestsMoreLabel: text,
      projectKeywordsLabel: text,
      researchKeywordsLabel: text,
      researchViewSuffix: text,
      participantsLabel: text,
      projectViewSuffix: text,
      projectVisualSuffix: text,
    }),
    wordmark: z.array(text).length(3),
    lab: z.strictObject({
      statement: text,
      principles: z.array(principleSchema).length(3),
      facts: z.array(factSchema).length(3),
    }),
  }),
});

const homePageSchema = z.strictObject({
  page: z.literal("home"),
  hero: z.strictObject({
    lines: z.array(heroLineSchema).length(3),
    metaPrimary: text,
    metaSecondary: text,
    titleEn: text.optional(),
    description: text.optional(),
    scrollLabel: text,
  }),
  intro: z.strictObject({
    index: text,
    eyebrow: text,
    aboutLinkLabel: text,
  }),
  research: z.strictObject({
    index: text,
    eyebrow: text,
    title: text,
    description: text,
    linkLabel: text,
    emptyLabel: text,
  }),
  projects: z.strictObject({
    index: text,
    eyebrow: text,
    title: text,
    description: text,
    linkLabel: text,
    emptyLabel: text,
  }),
  method: z.strictObject({
    index: text,
    eyebrow: text,
    title: text,
  }),
  people: z.strictObject({
    index: text,
    eyebrow: text,
    title: text,
    linkLabel: text,
  }),
});

const aboutPageSchema = z.strictObject({
  page: z.literal("about"),
  seo: seoSchema,
  hero: pageHeroSchema,
  manifestoLabel: text,
  bodyMeta: z.strictObject({
    index: text,
    eyebrow: text,
  }),
  principles: z.strictObject({
    index: text,
    eyebrow: text,
    title: text,
  }),
});

const researchPageSchema = z.strictObject({
  page: z.literal("research"),
  seo: seoSchema,
  hero: pageHeroSchema,
  listEyebrow: text,
  emptyLabel: text,
  detail: z.strictObject({
    breadcrumbLabel: text,
    yearLabel: text,
    statusLabel: text,
    noteLabel: text,
    nextLabel: text,
    nextAriaPrefix: text,
  }),
});

const projectsPageSchema = researchPageSchema.extend({ page: z.literal("projects") });

const peoplePageSchema = z.strictObject({
  page: z.literal("people"),
  seo: seoSchema,
  hero: pageHeroSchema,
  introEyebrow: text,
  introLines: z.array(text).length(2),
  organizationEyebrow: text,
  organizationTitle: text,
  yearSelectorAriaLabel: text,
  yearCountSuffix: text,
  statusYearSuffix: text,
  statusCountSuffix: text,
  leadershipLabel: text,
  membersLabel: text,
  emptyLabel: text,
  joinEyebrow: text,
  joinTitleLines: z.array(text).length(2),
  joinLinkLabel: text,
  profile: z.strictObject({
    historyLabel: text,
    researchLabel: text,
    projectsLabel: text,
    emptyResearchLabel: text,
    emptyProjectsLabel: text,
    backLabel: text,
  }),
  memberLinks: z.strictObject({
    github: text,
    website: text,
    email: text,
  }),
});

const notFoundPageSchema = z.strictObject({
  page: z.literal("404"),
  seoTitle: text,
  eyebrow: text,
  titleLines: z.array(text).length(2),
  description: text,
  homeLinkLabel: text,
});

const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/pages" }),
  schema: z.discriminatedUnion("page", [
    homePageSchema,
    aboutPageSchema,
    researchPageSchema,
    projectsPageSchema,
    peoplePageSchema,
    notFoundPageSchema,
  ]),
});

const activitySchema = z.strictObject({
  title: text,
  titleEn: text,
  summary: text,
  code: text,
  members: z.array(text).min(1, "참여자는 한 명 이상 필요합니다."),
  year: text.regex(/^\d{4}$/, "연도는 네 자리 숫자여야 합니다."),
  phase: z.enum(["Ongoing", "Exploration", "Archive"]),
  tags: z.array(text).min(1),
  visual: z.enum(["orbit", "grid", "wave"]),
  featured: z.boolean().default(false),
  order: z.number().int().nonnegative(),
});

const research = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/research" }),
  schema: activitySchema.extend({
    code: text.regex(/^R—\d{2}$/, "연구 코드는 R—01 형식이어야 합니다."),
  }),
});
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: activitySchema.extend({
    code: text.regex(/^P—\d{2}$/, "프로젝트 코드는 P—01 형식이어야 합니다."),
  }),
});

const members = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/members" }),
  schema: z.strictObject({
    name: text,
    nameEn: text,
    monogram: text.max(4).optional(),
    photo: text.regex(/^\//, "사진 경로는 /images/... 형식이어야 합니다.").optional(),
    interests: z.array(text),
    positions: z
      .array(
        z.strictObject({
          year: z.number().int().min(2000).max(2100),
          role: text,
          group: z.enum(["Undergraduate", "Graduate Student"]),
          level: z.enum(["leadership", "member"]).default("member"),
        }),
      )
      .min(1)
      .refine(
        (positions) =>
          new Set(positions.map(({ year }) => year)).size === positions.length,
        "한 구성원에게 같은 연도의 역할을 두 번 지정할 수 없습니다.",
      ),
    github: z.url().optional(),
    website: z.url().optional(),
    email: z.email().optional(),
  }),
});

export const collections = { site, pages, research, projects, members };
