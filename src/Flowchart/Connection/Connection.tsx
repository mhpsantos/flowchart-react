import {lineGenerator, locateConnector, pathing} from "../util";
import React, {useCallback, useMemo} from "react";
import {ConnectionData, ConnectorPosition, NodeData} from "../schema";
import {defaultConnectionColors, selectedConnectionColors} from "./constant";

interface ConnectionProps {
  data: ConnectionData;
  nodes: NodeData[];
  isSelected: boolean;
  onMouseDown: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  onDoubleClick?: (event: React.MouseEvent<SVGGElement, MouseEvent>) => void;
}

export default function ({
  data,
  nodes,
  isSelected,
  onMouseDown,
  onDoubleClick,
}: ConnectionProps) {
  const getNodeConnectorOffset = useCallback(
    (nodeId: number, connectorPosition: ConnectorPosition) => {
      const node = nodes.filter((item) => item.id === nodeId)[0];
      return locateConnector(node)[connectorPosition];
    },
    [nodes]
  );
  const points = pathing(
    getNodeConnectorOffset(data.source.id, data.source.position),
    getNodeConnectorOffset(data.destination.id, data.destination.position),
    data.source.position,
    data.destination.position
  );
  const colors = useMemo((): { pass: string; reject: string } => {
    return isSelected ? selectedConnectionColors : defaultConnectionColors;
  }, [isSelected]);
  return (
    <g>
      {points.map((_point, i) => {
        if (i > points.length - 2) {
          return <React.Fragment/>;
        }

        const source = points[i];
        const destination = points[i + 1];
        const isLast = i === points.length - 2;
        const color = colors[data.type];
        const id = `arrow${color.replace("#", "")}`;
        return (
          <React.Fragment key={i}>
            <path
              stroke={colors[data.type]}
              strokeWidth={1}
              fill={"none"}
              d={lineGenerator([source, destination])}
              markerEnd={isLast ? `url(#${id})` : undefined}
            />
            {isLast && (
              <marker
                id={id}
                markerUnits={"strokeWidth"}
                viewBox={"0 0 12 12"}
                refX={9}
                refY={6}
                markerWidth={12}
                markerHeight={12}
                orient={"auto"}
              >
                <path d={"M2,2 L10,6 L2,10 L6,6 L2,2"} fill={color} />
              </marker>
            )}
            <path
              onMouseDown={onMouseDown}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onDoubleClick?.(event);
              }}
              stroke={"transparent"}
              strokeWidth={5}
              fill={"none"}
              d={lineGenerator([source, destination])}
            />
          </React.Fragment>
        );
      })}
    </g>
  );
}
