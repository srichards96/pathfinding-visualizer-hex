import { FormEvent, useId } from "react";
import { useImmer } from "use-immer";

export type PathfindingVisualerFormValues = {
  cellSize: number;
  cellSpacing: number;
  animationSpeed: number;
};

type Props = {
  defaultValues: PathfindingVisualerFormValues;
  onSubmit: (values: PathfindingVisualerFormValues) => void;
};

export function OptionsForm({ defaultValues, onSubmit }: Props) {
  const [values, setValues] =
    useImmer<PathfindingVisualerFormValues>(defaultValues);
  const [validation, setValidation] = useImmer<
    Partial<Record<keyof PathfindingVisualerFormValues, string>>
  >({});

  function validateValues() {
    const { cellSize, cellSpacing, animationSpeed } = values;

    let valid = true;

    setValidation({});

    if (isNaN(cellSize) || typeof cellSize !== "number") {
      setValidation((draft) => {
        draft.cellSize = "Cell Size is required";
      });
      valid = false;
    } else if (cellSize < 20) {
      setValidation((draft) => {
        draft.cellSize = "Cell Size must be at least 20";
      });
      valid = false;
    } else if (cellSize > 80) {
      setValidation((draft) => {
        draft.cellSize = "Cell Size must be at most 80";
      });
      valid = false;
    }

    if (isNaN(cellSpacing) || typeof cellSpacing !== "number") {
      setValidation((draft) => {
        draft.cellSpacing = "Cell Spacing is required";
      });
      valid = false;
    } else if (cellSpacing < 1) {
      setValidation((draft) => {
        draft.cellSpacing = "Cell Spacing must be at least 1";
      });
      valid = false;
    } else if (cellSpacing > 16) {
      setValidation((draft) => {
        draft.cellSpacing = "Cell Spacing must be at most 16";
      });
      valid = false;
    }

    if (isNaN(animationSpeed) || typeof animationSpeed !== "number") {
      setValidation((draft) => {
        draft.animationSpeed = "Animation Speed is required";
      });
      valid = false;
    } else if (animationSpeed < 50) {
      setValidation((draft) => {
        draft.animationSpeed = "Animation Speed must be at least 50";
      });
      valid = false;
    } else if (animationSpeed > 1000) {
      setValidation((draft) => {
        draft.animationSpeed = "Animation Speed must be at most 1000";
      });
      valid = false;
    }

    return valid;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (validateValues()) {
      onSubmit(values);
    }
  }

  const cellSizeFieldId = useId();
  const cellSpacingFieldId = useId();
  const animationSpeedFieldId = useId();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor={cellSizeFieldId} className="inline-block">
          Cell Size:
        </label>
        <input
          id={cellSizeFieldId}
          className="bg-white text-black px-2 py-1 block w-full"
          type="number"
          value={values.cellSize}
          onChange={(e) => {
            const value = parseInt(e.currentTarget.value);

            setValues((draft) => {
              draft.cellSize = !isNaN(value)
                ? value
                : ("" as unknown as number);
            });
          }}
        />
        {validation.cellSize !== undefined && (
          <span className="block text-red-400">{validation.cellSize}</span>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={cellSpacingFieldId} className="inline-block">
          Cell Spacing:
        </label>
        <input
          id={cellSpacingFieldId}
          className="bg-white text-black px-2 py-1 block w-full"
          type="number"
          value={values.cellSpacing}
          onChange={(e) => {
            const value = parseInt(e.currentTarget.value);

            setValues((draft) => {
              draft.cellSpacing = !isNaN(value)
                ? value
                : ("" as unknown as number);
            });
          }}
        />
        {validation.cellSpacing !== undefined && (
          <span className="block text-red-400">{validation.cellSpacing}</span>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={animationSpeedFieldId} className="inline-block">
          Animation Speed (ms):
        </label>
        <input
          id={animationSpeedFieldId}
          className="bg-white text-black px-2 py-1 block w-full"
          type="number"
          value={values.animationSpeed}
          onChange={(e) => {
            const value = parseInt(e.currentTarget.value);

            setValues((draft) => {
              draft.animationSpeed = !isNaN(value)
                ? value
                : ("" as unknown as number);
            });
          }}
        />
        {validation.animationSpeed !== undefined && (
          <span className="block text-red-400">
            {validation.animationSpeed}
          </span>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          className="border px-4 py-2 rounded-sm transition-colors hover:bg-white/5 focus:bg-white/5 active:bg-white/10"
          onClick={() => setValues(defaultValues)}
        >
          Reset
        </button>
        <button
          type="submit"
          className="border border-violet-500 px-4 py-2 rounded-sm transition-colors bg-violet-800 hover:bg-violet-700 focus:bg-violet-700 active:bg-violet-600"
        >
          Apply
        </button>
      </div>
    </form>
  );
}
