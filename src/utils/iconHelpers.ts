export const getScalingProps = (width: number, height: number) => {
  const widthRatioEm = `${width / height}em`
  const viewBox = `0 0 ${width} ${height}`
  const style = { width: widthRatioEm }
  return { viewBox, style }
}
