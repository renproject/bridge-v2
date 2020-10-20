import { getScalingProps } from "./icons";

test("calculates scaling props for wide icon", () => {
  const props = getScalingProps(120, 30);
  expect(props).toEqual({
    style: {
      width: "4em",
    },
    viewBox: "0 0 120 30",
  });
});

test("calculates scaling props for tall icon", () => {
  const props = getScalingProps(16, 32);
  expect(props).toEqual({
    style: {
      width: "0.5em",
    },
    viewBox: "0 0 16 32",
  });
});
