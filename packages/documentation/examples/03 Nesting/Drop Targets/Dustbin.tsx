import React from 'react'
import PropTypes from 'prop-types'
import {
	DropTarget,
	DragSource,
	ConnectDragSource,
	ConnectDropTarget,
	DropTargetMonitor,
} from 'react-dnd'
import ItemTypes from './ItemTypes'

export const removeFromArray = (array, index) => ([
  ...array.slice(0, index),
  ...array.slice(index + 1),
]);

export const insertIntoArray = (array, index, object) => ([
  ...array.slice(0, index),
  object,
  ...array.slice(index),
]);

export const moveInArray = (array, sourceIndex, targetIndex) => {
  const item = array[sourceIndex];
  const delta = (sourceIndex < targetIndex) ? -1 : 0;

  return insertIntoArray(
    removeFromArray(array, sourceIndex),
    targetIndex + delta,
    item,
  );
};

function getStyle(backgroundColor: string): React.CSSProperties {
	return {
		border: '1px solid rgba(0,0,0,0.2)',
		minHeight: '8rem',
		minWidth: '8rem',
		color: 'white',
		backgroundColor,
		padding: '2rem',
		paddingTop: '1rem',
		textAlign: 'center',
		fontSize: '1rem',
	}
}

const boxTarget = {
	drop(
		props: DustbinProps,
		monitor: DropTargetMonitor,
		component: React.Component,
	) {
		if (!monitor.didDrop()) {
			return {
				...props,
				droppedOn: props.item,
				insertItem: droppedItem => props.insertItem(droppedItem, props.item),
			}
		}
	},
}

export interface DustbinProps {
	isOver?: boolean
	isOverCurrent?: boolean
	greedy?: boolean
	item: object
	onStateUpdate: (newState: object) => object
	connectDropTarget?: ConnectDropTarget
}

export interface DustbinState {
	hasDropped: boolean
	hasDroppedOnChild: boolean
}

const dustbinSource = {
	beginDrag(props) {
		return props;
	},
	endDrag(props, monitor, component) {
		// console.log('hello');
		// console.log(props, component)
		const dropResult = monitor.getDropResult();
		const dropItem = monitor.getItem();
		// console.log(dropResult, dropItem);
		// console.log('dropResult', dropResult);
		if (dropItem.parentId === dropResult.parentId) {
			dropItem.moveItem(props.item, dropResult.droppedOn);
		} else {
			dropResult.insertItem(props.item);
			dropItem.removeItem(props.item);
		}
		// // console.log(dropItem);
		// if (props.item.contents.indexOf(monitor.getDropResult()) === -1) {
		// 	// console.log('remove from contents');
		// 	return;
		// }
	}
}

@DropTarget(ItemTypes.BOX, boxTarget, (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver(),
	isOverCurrent: monitor.isOver({ shallow: true }),
}))
@DragSource(ItemTypes.BOX, dustbinSource, connect => ({
	connectDragSource: connect.dragSource(),
}))
export default class Dustbin extends React.Component<
	DustbinProps,
	DustbinState
> {
	public static propTypes = {
		connectDropTarget: PropTypes.func.isRequired,
		isOver: PropTypes.bool.isRequired,
		isOverCurrent: PropTypes.bool.isRequired,
		item: PropTypes.object.isRequired,
		reconcileState: PropTypes.func.isRequired,
		insertItem: PropTypes.func.isRequired,
		greedy: PropTypes.bool,
		children: PropTypes.node,
	}

	public static defaultProps = {
		greedy: true,
	}

	constructor(props: DustbinProps) {
		super(props)
		props.dustbinRef(this);
		this.reconcileState = () => {
			if (this.props.item.type === 'worksheet') {
				return { ...this.state.item };
			}
	
			return {
				...this.state.item,
				contents: this.state.item.contents.map(
					({ id }) => this.refs[id].reconcileState()
				),
			}
		}
	}
	
	public state = {
		item: {
			...this.props.item,
			isFromState: true,
		}
	}

	public render() {
		const {
			greedy,
			isOver,
			isOverCurrent,
			connectDropTarget,
			onStateUpdate,
			children,
		} = this.props
		const { item } = this.state
		if (item.type === 'group') {
			// console.log(item, this.state);
		}
		const { connectDragSource } = this.props

		const text = greedy ? 'greedy' : 'not greedy'
		let backgroundColor = 'rgba(0, 0, 0, .5)'

		if (isOverCurrent || (isOver && greedy)) {
			backgroundColor = 'darkgreen'
		}

		return (
			connectDropTarget &&
			connectDragSource && 
			connectDragSource(connectDropTarget(
				<div style={getStyle(backgroundColor)}>
					{text}
					<br />

					<div>
						{item.id}
						{item.contents && item.contents.map((child, idx) => (
							<Dustbin
								key={child.id}
								item={child}
								dustbinRef={(ref) => {
									this.refs = { ...this.refs, [child.id]: ref };
								}}
								parentId={item.id}
								greedy={child.type === 'group'}
								moveItem={(dragItem, above) => {
									const dragItemIndex = item.contents.indexOf(dragItem);
									const insertIndex = item.contents.indexOf(above);
									// console.log('moveItem', item.contents, dragItemIndex, insertIndex)
									// console.log('after', moveInArray(item.contents, dragItemIndex, insertIndex));
									this.setState(() => ({
										item: {
											...item,
											contents: moveInArray(item.contents, dragItemIndex, insertIndex),
										}
									}));
								}}
								insertItem={(dragItem, above) => {
									const insertIndex = item.contents.indexOf(above);
									// console.log('insertItem')
									this.setState({
										item: {
											...item,
											contents: insertIntoArray(item.contents, insertIndex, dragItem),
										}
									});
								}}
								removeItem={(dragItem) => {
									const removeIndex = item.contents.indexOf(dragItem);
									// console.log('removeItem');
									this.setState({
										item: {
											...item,
											contents: removeFromArray(item.contents, removeIndex)
										},
									});
								}}
								reconcileState={() => {
									return reconcileState(item);
								}}
							/>
						))}
					</div>
				</div>,	
		)))
	}
}
