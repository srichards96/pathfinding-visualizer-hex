import { FormEvent, useId } from "react";
import { useImmer } from "use-immer";

type CellPrainbrush =
  | {
      type: "start" | "target" | "empty" | "wall";
    }
  | {
      type: "weighted";
      weight: number;
    };

export type PathfindingVisualerFormValues = {
  cellSize: number;
  cellSpacing: number;
  animationSpeed: number;
  cellPaintbrush: CellPrainbrush;
};

type FormValidation = {
  cellSize?: string;
  cellSpacing?: string;
  animationSpeed?: string;
  cellPaintbrush?: {
    type?: string;
    weight?: string;
  };
};

type Props = {
  defaultValues: PathfindingVisualerFormValues;
  onSubmit: (values: PathfindingVisualerFormValues) => void;
};

export function OptionsForm({ defaultValues, onSubmit }: Props) {
  const [values, setValues] =
    useImmer<PathfindingVisualerFormValues>(defaultValues);
  const [validation, setValidation] = useImmer<FormValidation>({});

  function validateValues() {
    const { cellPaintbrush, cellSize, cellSpacing, animationSpeed } = values;

    let valid = true;

    setValidation({});

    if (cellPaintbrush.type === "weighted") {
      const { weight } = cellPaintbrush;
      if (isNaN(weight) || typeof weight !== "number") {
        setValidation((draft) => {
          draft.cellPaintbrush ??= {};
          draft.cellPaintbrush.weight = "Paintbrush Weight is required";
        });
        valid = false;
      } else if (weight < 1) {
        setValidation((draft) => {
          draft.cellPaintbrush ??= {};
          draft.cellSize = "Paintbrush Weight must be at least 1";
        });
        valid = false;
      } else if (cellSize > 1000) {
        setValidation((draft) => {
          draft.cellPaintbrush ??= {};
          draft.cellSize = "Plainbrush Weight must be at most 1000";
        });
        valid = false;
      }
    }

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

  const paintbrushFieldName = useId();
  const paintbrushWeightFieldId = useId();
  const cellSizeFieldId = useId();
  const cellSpacingFieldId = useId();
  const animationSpeedFieldId = useId();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 border p-2 rounded-sm relative">
        <h2 className="text-xl absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 bg-gray-800 px-2">
          Paintbrush
        </h2>

        <span className="inline-block mb-2">Type:</span>

        <fieldset className="grid grid-cols-2">
          <div className="space-y-1">
            <label className="flex gap-2 items-center">
              <input
                name={paintbrushFieldName}
                type="radio"
                checked={values.cellPaintbrush.type === "empty"}
                value="empty"
                onChange={() =>
                  setValues((draft) => {
                    draft.cellPaintbrush = { type: "empty" };
                  })
                }
              />
              Empty
            </label>
            <label className="flex gap-2 items-center">
              <input
                name={paintbrushFieldName}
                type="radio"
                checked={values.cellPaintbrush.type === "wall"}
                value="wall"
                onChange={() =>
                  setValues((draft) => {
                    draft.cellPaintbrush = { type: "wall" };
                  })
                }
              />
              Wall
            </label>
            <label className="flex gap-2 items-center">
              <input
                name={paintbrushFieldName}
                type="radio"
                checked={values.cellPaintbrush.type === "weighted"}
                value="weighted"
                onChange={() =>
                  setValues((draft) => {
                    draft.cellPaintbrush = { type: "weighted", weight: 1 };
                  })
                }
              />
              Weighted
            </label>
          </div>

          <div className="space-y-1">
            <label className="flex gap-2 items-center">
              <input
                name={paintbrushFieldName}
                type="radio"
                checked={values.cellPaintbrush.type === "start"}
                value="start"
                onChange={() =>
                  setValues((draft) => {
                    draft.cellPaintbrush = { type: "start" };
                  })
                }
              />
              Start
            </label>
            <label className="flex gap-2 items-center">
              <input
                name={paintbrushFieldName}
                type="radio"
                checked={values.cellPaintbrush.type === "target"}
                value="target"
                onChange={() =>
                  setValues((draft) => {
                    draft.cellPaintbrush = { type: "target" };
                  })
                }
              />
              Target
            </label>
          </div>
        </fieldset>

        {values.cellPaintbrush.type === "weighted" && (
          <div className="space-y-2">
            <label htmlFor={paintbrushWeightFieldId} className="inline-block">
              Weight:
            </label>
            <input
              id={paintbrushWeightFieldId}
              className="bg-white text-black px-2 py-1 block w-full"
              type="number"
              value={values.cellPaintbrush.weight}
              onChange={(e) => {
                const value = parseInt(e.currentTarget.value);

                setValues((draft) => {
                  if (draft.cellPaintbrush.type === "weighted") {
                    draft.cellPaintbrush.weight = !isNaN(value)
                      ? value
                      : ("" as unknown as number);
                  }
                });
              }}
            />
            {validation.cellPaintbrush?.weight !== undefined && (
              <span className="inline-block text-red-400">
                {validation.cellPaintbrush.weight}
              </span>
            )}
          </div>
        )}
      </div>

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
