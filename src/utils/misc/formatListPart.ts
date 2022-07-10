const formatListPart = (listPart: { type: 'element' | 'literal'; value: string }) => {
  if (listPart.type !== 'element') {
    return listPart.value;
  }

  return `<b>${listPart.value}</b>`;
};

export default formatListPart;
