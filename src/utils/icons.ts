export const getScalingProps = (width: number, height = width) => {
  const viewBox = `0 0 ${width} ${height}`;
  const ratio = width / height;
  if (ratio !== 1) {
    const widthRatioEm = `${width / height}em`;
    const style = { width: widthRatioEm };
    return { viewBox, style };
  }
  return { viewBox };
};
