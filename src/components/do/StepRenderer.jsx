import PropTypes from "prop-types";
import InfoStep from "./steps/InfoStep";
import ChoiceStep from "./steps/ChoiceStep";
import ChecklistStep from "./steps/ChecklistStep";
import ActionStep from "./steps/ActionStep";
import CompletionStep from "./steps/CompletionStep";

const STEP_COMPONENTS = {
  info: InfoStep,
  choice: ChoiceStep,
  checklist: ChecklistStep,
  action: ActionStep,
  completion: CompletionStep,
};

export default function StepRenderer({ step, journey, onNext, onComplete, onSaveData }) {
  const Component = STEP_COMPONENTS[step.type];
  if (!Component) {
    return <div>Unknown step type: {step.type}</div>;
  }
  return (
    <Component
      step={step}
      journey={journey}
      onNext={onNext}
      onComplete={onComplete}
      onSaveData={onSaveData}
    />
  );
}

StepRenderer.propTypes = {
  step: PropTypes.shape({
    type: PropTypes.string.isRequired,
    id: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  journey: PropTypes.object.isRequired,
  onNext: PropTypes.func.isRequired,
  onComplete: PropTypes.func,
  onSaveData: PropTypes.func,
};
