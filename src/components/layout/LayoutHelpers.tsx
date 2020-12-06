import { styled } from "@material-ui/core/styles";

export const NarrowCenteredWrapper = styled("div")({
  marginLeft: "auto",
  marginRight: "auto",
  maxWidth: 400,
});

export const CenteringSpacedBox = styled("div")({
  display: "flex",
  justifyContent: "center",
  marginBottom: 20,
});

export const SmallWrapper = styled("div")({
  marginBottom: 10,
});

export const MediumWrapper = styled("div")({
  marginBottom: 20,
});

export const BigWrapper = styled("div")({
  marginBottom: 40,
});

export const SmallTopWrapper = styled("div")({
  marginTop: 10,
});

export const MediumTopWrapper = styled("div")({
  marginTop: 20,
});

export const BigTopWrapper = styled("div")({
  marginTop: 40,
});

export const PaperSpacerWrapper = styled("div")({
  marginTop: 40,
  marginBottom: 40,
});
