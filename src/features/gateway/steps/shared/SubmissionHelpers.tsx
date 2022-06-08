export type SubmittingProps = {
  onSubmit: () => void;
  onReset: () => void;
  submitting: boolean;
  waiting: boolean;
  done?: boolean;
  submittingDisabled?: boolean;
  submittingError?: any;
  //TODO: deprecated, remove
  errorSubmitting?: any;
};
