// FAQ is stored as plain text: question on its own line, answer on the
// line(s) below it, blocks separated by a blank line — same convention as
// the paragraph-per-blank-line format already used for post content.
function parseFaq(raw) {
  if (!raw) return [];
  return raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [question, ...rest] = block.split("\n");
      return { question: question.trim(), answer: rest.join(" ").trim() };
    })
    .filter((item) => item.question && item.answer);
}

export { parseFaq };
