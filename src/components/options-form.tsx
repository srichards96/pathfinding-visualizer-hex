import { useCallback, useEffect, useId, useMemo } from "react";
import { useImmer } from "use-immer";
import {
  HexGridPathfindingAlgorithmName,
  HexGridPathfindingAlgorithmNames,
} from "../constants/hex/hex-grid-pathfinding-algorithms";
import { Asterisk, Flag, PersonStanding } from "lucide-react";
import { calculateHexCellSizingData } from "../util/hex/calculate-hex-cell-sizing-data";
import { HexCell } from "./hex-cell";

const hexGridPathfindingAlgorithmNamesSet = new Set<string>(
  Object.values(HexGridPathfindingAlgorithmNames)
);

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
  algorithm: HexGridPathfindingAlgorithmName;
};

type FormValidation = {
  cellSize?: string;
  cellSpacing?: string;
  animationSpeed?: string;
  cellPaintbrush?: {
    type?: string;
    weight?: string;
  };
  algorithm?: string;
};

type Props = {
  defaultValues: PathfindingVisualerFormValues;
  onSubmit: (values: PathfindingVisualerFormValues) => void;
};

export function OptionsForm({ defaultValues, onSubmit }: Props) {
  const hexSizingData = useMemo(() => {
    return {
      inner: calculateHexCellSizingData({ sideLength: 12, spacing: 0 }),
      outer: calculateHexCellSizingData({ sideLength: 14, spacing: 0 }),
    };
  }, []);

  const [values, setValues] =
    useImmer<PathfindingVisualerFormValues>(defaultValues);
  const [validation, setValidation] = useImmer<FormValidation>({});

  const validateValues = useCallback(() => {
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
          draft.cellPaintbrush.weight = "Paintbrush Weight must be at least 1";
        });
        valid = false;
      } else if (weight > 1000) {
        setValidation((draft) => {
          draft.cellPaintbrush ??= {};
          draft.cellPaintbrush.weight =
            "Plainbrush Weight must be at most 1000";
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
  }, [values, setValidation]);

  // When input values change, validate them, and if valid update the real values
  useEffect(() => {
    if (validateValues()) {
      onSubmit(values);
    }
  }, [onSubmit, values, validateValues]);

  const paintbrushFieldName = useId();
  const paintbrushWeightFieldId = useId();
  const cellSizeFieldId = useId();
  const cellSpacingFieldId = useId();
  const animationSpeedFieldId = useId();
  const algorithmFieldId = useId();

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <h2 className="text-2xl">Options:</h2>
      <div className="space-y-2 border p-2 rounded-sm relative">
        <h2 className="text-xl absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 bg-gray-800 px-2">
          Paintbrush
        </h2>

        <span className="inline-block mb-2">Type:</span>

        <fieldset className="grid grid-cols-2 gap-1">
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
            <PersonStanding />
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
            <Flag />
          </label>

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
            <HexCell style={hexSizingData.inner} data-weight={1} />
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
            <HexCell
              style={hexSizingData.outer}
              className="!bg-white flex items-center justify-center"
            >
              <HexCell style={hexSizingData.inner} data-wall={true} />
            </HexCell>
          </label>

          <label className="flex gap-2 items-center">
            <input
              name={paintbrushFieldName}
              type="radio"
              checked={values.cellPaintbrush.type === "weighted"}
              value="weighted"
              onChange={() =>
                setValues((draft) => {
                  draft.cellPaintbrush = { type: "weighted", weight: 2 };
                })
              }
            />
            Weighted
            <HexCell
              style={hexSizingData.outer}
              className="!bg-white flex items-center justify-center shrink-0"
            >
              <HexCell
                style={hexSizingData.inner}
                data-weight={2}
                className="flex items-center justify-center font-bold text-sm"
              >
                <Asterisk className="size-4" />
              </HexCell>
            </HexCell>
          </label>
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
              min={1}
              max={1000}
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
          min={20}
          max={80}
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
          min={1}
          max={16}
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
          min={50}
          max={1000}
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

      <div className="space-y-2">
        <label htmlFor={algorithmFieldId} className="inline-block">
          Algorithm:
        </label>
        <select
          id={algorithmFieldId}
          className="bg-white text-black px-2 py-1 block w-full"
          value={values.algorithm}
          onChange={(e) => {
            const { value } = e.currentTarget;

            if (
              hexGridPathfindingAlgorithmNamesSet.has(e.currentTarget.value)
            ) {
              setValues((draft) => {
                draft.algorithm = value as HexGridPathfindingAlgorithmName;
              });
            }
          }}
        >
          <option value={HexGridPathfindingAlgorithmNames.breadthFirstSearch}>
            Breadth First Search
          </option>
          <option value={HexGridPathfindingAlgorithmNames.dijkstrasAlgorithm}>
            Dijkstra's Algorithm
          </option>
          <option value={HexGridPathfindingAlgorithmNames.aStar}>A*</option>
        </select>
      </div>
    </form>
  );
}
