import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_COURSES,
  INITIAL_DAYS,
  type CourseItem,
  type KnowledgeLevel,
  type StudyDay,
  type VocabularyLevel,
} from "./study-data";

export const STORAGE_KEY = "cft-study-companion:v1";

export interface KnowledgeEntry {
  level: KnowledgeLevel;
  initialLevel: KnowledgeLevel;
  updatedAt: string;
}
export interface StudyEvent {
  id: string;
  dayId: string;
  dayNumber: number;
  kind: "status" | "reorder" | "reschedule" | "notes" | "time";
  detail: string;
  at: string;
}
export interface ReviewItem {
  id: string;
  topicId: string;
  topic: string;
  reason: string;
  dueAt: string;
  difficulty: "fácil" | "médio" | "difícil";
  source: string;
  completedAt?: string;
  postponedUntil?: string;
  reviewCount?: number;
}
export interface JobPosting {
  id: string;
  title: string;
  company: string;
  sourceUrl: string;
  description: string;
  addedAt: string;
}
export interface QuizAttempt {
  id: string;
  date: string;
  score: number;
  total: number;
  topicScores: Record<string, { correct: number; total: number }>;
  missedTopicIds: string[];
}
export interface StudyNote {
  id: string;
  title: string;
  content: string;
  topic: string;
  courseId: string;
  dayId: string;
  externalUrl: string;
  important: boolean;
  updatedAt: string;
}
export interface InterviewRecord {
  questionId: string;
  answer: string;
  feedback: string;
  practicedAt: string;
}
export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: string;
}
export interface StudyState {
  version: 1;
  startedOn: string;
  plannedHoursPerDay: number;
  reviewIntervalsDays: number[];
  days: StudyDay[];
  knowledge: Record<string, KnowledgeEntry>;
  courses: CourseItem[];
  notes: StudyNote[];
  vocabularyLevels: Record<string, VocabularyLevel>;
  quizAttempts: QuizAttempt[];
  scenarioResponses: Record<string, { answer: string; completedAt?: string }>;
  interviews: Record<string, InterviewRecord>;
  jobPostings: JobPosting[];
  tutorMessages: TutorMessage[];
  reviews: ReviewItem[];
  activityHistory: StudyEvent[];
}

const todayKey = () => new Date().toISOString().slice(0, 10);
export const newId = (prefix: string) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;

export function createInitialState(): StudyState {
  return {
    version: 1,
    startedOn: todayKey(),
    plannedHoursPerDay: 1.25,
    reviewIntervalsDays: [1, 3, 7, 14],
    days: INITIAL_DAYS.map(item => ({
      ...item,
      actualMinutes: 0,
      topics: [...item.topics],
      activities: [...item.activities],
    })),
    knowledge: {},
    courses: INITIAL_COURSES.map(item => ({ ...item })),
    notes: [],
    vocabularyLevels: {},
    quizAttempts: [],
    scenarioResponses: {},
    interviews: {},
    jobPostings: [],
    tutorMessages: [],
    reviews: [],
    activityHistory: [],
  };
}

function restoreState(raw: string | null): StudyState {
  const base = createInitialState();
  if (!raw) return base;
  try {
    const parsed = JSON.parse(raw) as Partial<StudyState>;
    if (parsed.version !== 1) return base;
    return {
      ...base,
      ...parsed,
      days:
        Array.isArray(parsed.days) && parsed.days.length
          ? parsed.days.map(item => ({
              ...item,
              resources: Array.isArray(item.resources) ? item.resources : [],
              actualMinutes: Math.max(0, Number(item.actualMinutes) || 0),
            }))
          : base.days,
      courses: Array.isArray(parsed.courses) ? parsed.courses : base.courses,
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      reviewIntervalsDays: Array.isArray(parsed.reviewIntervalsDays)
        ? parsed.reviewIntervalsDays
        : base.reviewIntervalsDays,
      knowledge:
        parsed.knowledge && typeof parsed.knowledge === "object"
          ? parsed.knowledge
          : {},
      vocabularyLevels:
        parsed.vocabularyLevels && typeof parsed.vocabularyLevels === "object"
          ? parsed.vocabularyLevels
          : {},
      quizAttempts: Array.isArray(parsed.quizAttempts)
        ? parsed.quizAttempts
        : [],
      scenarioResponses:
        parsed.scenarioResponses && typeof parsed.scenarioResponses === "object"
          ? parsed.scenarioResponses
          : {},
      interviews:
        parsed.interviews && typeof parsed.interviews === "object"
          ? parsed.interviews
          : {},
      jobPostings: Array.isArray(parsed.jobPostings) ? parsed.jobPostings : [],
      tutorMessages: Array.isArray(parsed.tutorMessages)
        ? parsed.tutorMessages.slice(-40)
        : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
      activityHistory: Array.isArray(parsed.activityHistory)
        ? parsed.activityHistory
        : [],
    };
  } catch {
    return base;
  }
}

interface StudyContextValue {
  state: StudyState;
  updateDay: (
    id: string,
    patch: Partial<StudyDay>,
    kind?: StudyEvent["kind"],
    detail?: string
  ) => void;
  moveDay: (id: string, direction: -1 | 1) => void;
  setKnowledge: (topicId: string, level: KnowledgeLevel) => void;
  setPlannedHours: (hours: number) => void;
  setStartedOn: (date: string) => void;
  setReviewIntervals: (intervals: number[]) => void;
  addReview: (
    review: Omit<ReviewItem, "id" | "dueAt" | "completedAt" | "postponedUntil">,
    daysUntil?: number
  ) => void;
  completeReview: (id: string, difficulty?: ReviewItem["difficulty"]) => void;
  postponeReview: (id: string, days?: number) => void;
  addQuizAttempt: (attempt: Omit<QuizAttempt, "id" | "date">) => void;
  setVocabularyLevel: (termId: string, level: VocabularyLevel) => void;
  saveScenarioAnswer: (
    scenarioId: string,
    answer: string,
    completed?: boolean
  ) => void;
  saveInterviewAnswer: (
    questionId: string,
    answer: string,
    feedback?: string
  ) => void;
  saveJobPosting: (
    posting: Omit<JobPosting, "id" | "addedAt"> & { id?: string }
  ) => void;
  deleteJobPosting: (id: string) => void;
  saveTutorMessages: (messages: TutorMessage[]) => void;
  addNote: (note: Omit<StudyNote, "id" | "updatedAt">) => void;
  updateNote: (id: string, patch: Partial<StudyNote>) => void;
  deleteNote: (id: string) => void;
  saveCourse: (course: CourseItem) => void;
  deleteCourse: (id: string) => void;
  exportData: () => void;
  importData: (json: string) => boolean;
  resetData: () => void;
}

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(() => {
    try {
      return restoreState(
        typeof window === "undefined"
          ? null
          : window.localStorage.getItem(STORAGE_KEY)
      );
    } catch {
      return createInitialState();
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn(
        "Não foi possível salvar o progresso neste navegador.",
        error
      );
    }
  }, [state]);

  const updateDay = useCallback(
    (
      id: string,
      patch: Partial<StudyDay>,
      kind: StudyEvent["kind"] = "status",
      detail = "Atividade atualizada"
    ) => {
      setState(previous => {
        const existing = previous.days.find(item => item.id === id);
        if (!existing) return previous;
        const updated = { ...existing, ...patch };
        if (
          patch.status === "Completed" &&
          !patch.completedAt &&
          !existing.completedAt
        )
          updated.completedAt = todayKey();
        if (patch.status && patch.status !== "Completed")
          delete updated.completedAt;
        const event: StudyEvent = {
          id: newId("event"),
          dayId: id,
          dayNumber: existing.day,
          kind,
          detail,
          at: new Date().toISOString(),
        };
        return {
          ...previous,
          days: previous.days.map(item => (item.id === id ? updated : item)),
          activityHistory: [...previous.activityHistory, event],
        };
      });
    },
    []
  );

  const moveDay = useCallback((id: string, direction: -1 | 1) => {
    setState(previous => {
      const index = previous.days.findIndex(item => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= previous.days.length)
        return previous;
      if (
        previous.days[index].status === "Completed" ||
        previous.days[nextIndex].status === "Completed"
      )
        return previous;
      const reordered = [...previous.days];
      [reordered[index], reordered[nextIndex]] = [
        reordered[nextIndex],
        reordered[index],
      ];
      const moved = previous.days[index];
      const event: StudyEvent = {
        id: newId("event"),
        dayId: id,
        dayNumber: moved.day,
        kind: "reorder",
        detail: `Movido na ordem do plano (${moved.day})`,
        at: new Date().toISOString(),
      };
      return {
        ...previous,
        days: reordered,
        activityHistory: [...previous.activityHistory, event],
      };
    });
  }, []);

  const setKnowledge = useCallback(
    (topicId: string, level: KnowledgeLevel) =>
      setState(previous => {
        const existing = previous.knowledge[topicId];
        return {
          ...previous,
          knowledge: {
            ...previous.knowledge,
            [topicId]: {
              level,
              initialLevel: existing?.initialLevel ?? level,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }),
    []
  );
  const setPlannedHours = useCallback(
    (hours: number) =>
      setState(previous => ({
        ...previous,
        plannedHoursPerDay: Math.min(8, Math.max(0.25, hours)),
      })),
    []
  );
  const setStartedOn = useCallback(
    (date: string) =>
      setState(previous => ({
        ...previous,
        startedOn: date || previous.startedOn,
      })),
    []
  );
  const setReviewIntervals = useCallback(
    (intervals: number[]) =>
      setState(previous => ({
        ...previous,
        reviewIntervalsDays: intervals
          .map(value => Math.min(90, Math.max(1, Math.round(value))))
          .slice(0, 8),
      })),
    []
  );
  const addReview = useCallback(
    (
      review: Omit<
        ReviewItem,
        "id" | "dueAt" | "completedAt" | "postponedUntil"
      >,
      daysUntil = 1
    ) =>
      setState(previous => {
        const existing = previous.reviews.find(
          item =>
            item.topicId === review.topicId &&
            item.source === review.source &&
            !item.completedAt
        );
        const due = new Date();
        due.setDate(due.getDate() + daysUntil);
        const item: ReviewItem = {
          ...review,
          id: existing?.id ?? newId("review"),
          dueAt: due.toISOString(),
          difficulty: review.difficulty ?? "médio",
          reviewCount: existing?.reviewCount ?? 0,
        };
        return {
          ...previous,
          reviews: existing
            ? previous.reviews.map(value =>
                value.id === existing.id ? item : value
              )
            : [...previous.reviews, item],
        };
      }),
    []
  );
  const completeReview = useCallback(
    (id: string, difficulty?: ReviewItem["difficulty"]) =>
      setState(previous => {
        const current = previous.reviews.find(
          item => item.id === id && !item.completedAt
        );
        if (!current) return previous;
        const completedAt = new Date();
        const reportedDifficulty = difficulty ?? current.difficulty;
        const lastStage = Math.max(0, previous.reviewIntervalsDays.length - 1);
        const nextStage =
          reportedDifficulty === "difícil"
            ? 0
            : Math.min((current.reviewCount ?? 0) + 1, lastStage);
        const nextDue = new Date(completedAt);
        nextDue.setDate(
          nextDue.getDate() + (previous.reviewIntervalsDays[nextStage] ?? 1)
        );
        const completed = {
          ...current,
          completedAt: completedAt.toISOString(),
          difficulty: reportedDifficulty,
        };
        const scheduled: ReviewItem = {
          ...current,
          id: newId("review"),
          dueAt: nextDue.toISOString(),
          difficulty: reportedDifficulty,
          reviewCount: nextStage,
          completedAt: undefined,
          postponedUntil: undefined,
        };
        return {
          ...previous,
          reviews: [
            ...previous.reviews.map(item =>
              item.id === id ? completed : item
            ),
            scheduled,
          ],
        };
      }),
    []
  );
  const postponeReview = useCallback(
    (id: string, days = 1) =>
      setState(previous => {
        if (!previous.reviews.some(item => item.id === id)) return previous;
        return {
          ...previous,
          reviews: previous.reviews.map(item => {
            if (item.id !== id) return item;
            const postponed = new Date();
            postponed.setDate(postponed.getDate() + days);
            return {
              ...item,
              dueAt: postponed.toISOString(),
              postponedUntil: postponed.toISOString(),
            };
          }),
        };
      }),
    []
  );
  const addQuizAttempt = useCallback(
    (attempt: Omit<QuizAttempt, "id" | "date">) =>
      setState(previous => ({
        ...previous,
        quizAttempts: [
          ...previous.quizAttempts,
          { ...attempt, id: newId("quiz"), date: new Date().toISOString() },
        ],
      })),
    []
  );
  const setVocabularyLevel = useCallback(
    (termId: string, level: VocabularyLevel) =>
      setState(previous => ({
        ...previous,
        vocabularyLevels: { ...previous.vocabularyLevels, [termId]: level },
      })),
    []
  );
  const saveScenarioAnswer = useCallback(
    (scenarioId: string, answer: string, completed = false) =>
      setState(previous => ({
        ...previous,
        scenarioResponses: {
          ...previous.scenarioResponses,
          [scenarioId]: {
            answer,
            ...(completed ? { completedAt: new Date().toISOString() } : {}),
          },
        },
      })),
    []
  );
  const saveInterviewAnswer = useCallback(
    (questionId: string, answer: string, feedback = "") =>
      setState(previous => ({
        ...previous,
        interviews: {
          ...previous.interviews,
          [questionId]: {
            questionId,
            answer,
            feedback,
            practicedAt: new Date().toISOString(),
          },
        },
      })),
    []
  );
  const saveJobPosting = useCallback(
    (posting: Omit<JobPosting, "id" | "addedAt"> & { id?: string }) =>
      setState(previous => {
        const existing = posting.id
          ? previous.jobPostings.find(item => item.id === posting.id)
          : undefined;
        const item: JobPosting = {
          ...posting,
          id: existing?.id ?? posting.id ?? newId("job"),
          addedAt: existing?.addedAt ?? new Date().toISOString(),
        };
        return {
          ...previous,
          jobPostings: existing
            ? previous.jobPostings.map(value =>
                value.id === existing.id ? item : value
              )
            : [...previous.jobPostings, item],
        };
      }),
    []
  );
  const deleteJobPosting = useCallback(
    (id: string) =>
      setState(previous => ({
        ...previous,
        jobPostings: previous.jobPostings.filter(item => item.id !== id),
      })),
    []
  );
  const saveTutorMessages = useCallback(
    (messages: TutorMessage[]) =>
      setState(previous => ({
        ...previous,
        tutorMessages: messages.slice(-40),
      })),
    []
  );
  const addNote = useCallback(
    (note: Omit<StudyNote, "id" | "updatedAt">) =>
      setState(previous => ({
        ...previous,
        notes: [
          { ...note, id: newId("note"), updatedAt: new Date().toISOString() },
          ...previous.notes,
        ],
      })),
    []
  );
  const updateNote = useCallback(
    (id: string, patch: Partial<StudyNote>) =>
      setState(previous => ({
        ...previous,
        notes: previous.notes.map(note =>
          note.id === id
            ? { ...note, ...patch, updatedAt: new Date().toISOString() }
            : note
        ),
      })),
    []
  );
  const deleteNote = useCallback(
    (id: string) =>
      setState(previous => ({
        ...previous,
        notes: previous.notes.filter(note => note.id !== id),
      })),
    []
  );
  const saveCourse = useCallback(
    (course: CourseItem) =>
      setState(previous => ({
        ...previous,
        courses: previous.courses.some(item => item.id === course.id)
          ? previous.courses.map(item =>
              item.id === course.id ? course : item
            )
          : [...previous.courses, course],
      })),
    []
  );
  const deleteCourse = useCallback(
    (id: string) =>
      setState(previous => ({
        ...previous,
        courses: previous.courses.filter(course => course.id !== id),
      })),
    []
  );
  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cft-study-backup-${todayKey()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [state]);
  const importData = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as Partial<StudyState>;
      if (parsed?.version !== 1 || !Array.isArray(parsed?.days)) return false;
      setState(restoreState(json));
      return true;
    } catch {
      return false;
    }
  }, []);
  const resetData = useCallback(() => {
    const clean = createInitialState();
    setState(clean);
  }, []);
  const value = useMemo<StudyContextValue>(
    () => ({
      state,
      updateDay,
      moveDay,
      setKnowledge,
      setPlannedHours,
      setStartedOn,
      setReviewIntervals,
      addReview,
      completeReview,
      postponeReview,
      addQuizAttempt,
      setVocabularyLevel,
      saveScenarioAnswer,
      saveInterviewAnswer,
      saveJobPosting,
      deleteJobPosting,
      saveTutorMessages,
      addNote,
      updateNote,
      deleteNote,
      saveCourse,
      deleteCourse,
      exportData,
      importData,
      resetData,
    }),
    [
      state,
      updateDay,
      moveDay,
      setKnowledge,
      setPlannedHours,
      setStartedOn,
      setReviewIntervals,
      addReview,
      completeReview,
      postponeReview,
      addQuizAttempt,
      setVocabularyLevel,
      saveScenarioAnswer,
      saveInterviewAnswer,
      saveJobPosting,
      deleteJobPosting,
      saveTutorMessages,
      addNote,
      updateNote,
      deleteNote,
      saveCourse,
      deleteCourse,
      exportData,
      importData,
      resetData,
    ]
  );
  return (
    <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
  );
}

export function useStudy() {
  const value = useContext(StudyContext);
  if (!value)
    throw new Error("useStudy deve ser usado dentro de StudyProvider");
  return value;
}

export function minutesStudied(state: StudyState) {
  return (
    state.days.reduce(
      (total, item) => total + Math.max(0, Number(item.actualMinutes) || 0),
      0
    ) +
    state.courses.reduce(
      (total, course) => total + (Number(course.actualHours) || 0) * 60,
      0
    )
  );
}
