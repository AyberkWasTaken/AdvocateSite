const BLOG_CATEGORIES = [
  { value: "aile-hukuku", label: "Aile Hukuku" },
  { value: "is-hukuku", label: "İş Hukuku" },
  { value: "ceza-hukuku", label: "Ceza Hukuku" },
  { value: "icra-iflas-hukuku", label: "İcra ve İflas Hukuku" },
  { value: "gayrimenkul-hukuku", label: "Gayrimenkul Hukuku" },
  { value: "tuketici-ticaret-hukuku", label: "Tüketici ve Ticaret Hukuku" },
];

function categoryLabel(value) {
  const found = BLOG_CATEGORIES.find((c) => c.value === value);
  return found ? found.label : null;
}

export { BLOG_CATEGORIES, categoryLabel };
