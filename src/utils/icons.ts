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

export const getPaddedScalingProps = (width: number, height = width) => {
  const factor = 0.1; // 0.1 => 10% padding inside
  const offsetX = factor * width;
  const offsetY = factor * height;
  const viewBox = `-${offsetX} -${offsetY} ${width + 2 * offsetX} ${
    height + 2 * offsetY
  }`;
  const ratio = width / height;
  if (ratio !== 1) {
    const widthRatioEm = `${width / height}em`;
    const style = { width: widthRatioEm };
    return { viewBox, style };
  }
  return { viewBox };
};
