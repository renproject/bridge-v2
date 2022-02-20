export type SubmittingProps = {
  onSubmit: () => void;
  onReset: () => void; //TODO make not required
  submitting: boolean;
  waiting: boolean; //TODO make not required
  done: boolean; //TODO make not required
  errorSubmitting?: any;
};
