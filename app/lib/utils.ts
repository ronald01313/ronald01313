export const formatDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";

  return date.toISOString().split("T")[0];
};

export const countReactions = (reactions: any[], type: string) => {
  return reactions?.filter((r) => r.reaction === type).length || 0;
};
