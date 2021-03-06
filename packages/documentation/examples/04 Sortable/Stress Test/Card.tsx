import React from 'react'
import PropTypes from 'prop-types'
import {
	DragSource,
	DropTarget,
	ConnectDragSource,
	ConnectDropTarget,
	DropTargetMonitor,
} from 'react-dnd'
import ItemTypes from './ItemTypes'

const style: React.CSSProperties = {
	border: '1px dashed gray',
	padding: '0.5rem 1rem',
	marginBottom: '.5rem',
	backgroundColor: 'white',
	cursor: 'move',
}

const cardSource = {
	beginDrag(props: CardProps) {
		return { id: props.id }
	},
}

const cardTarget = {
	hover(props: CardProps, monitor: DropTargetMonitor) {
		const draggedId = monitor.getItem().id

		if (draggedId !== props.id) {
			props.moveCard(draggedId, props.id)
		}
	},
}

export interface CardProps {
	id: any
	text: string
	isDragging?: boolean
	connectDragSource?: ConnectDragSource
	connectDropTarget?: ConnectDropTarget
	moveCard: (draggedId: string, id: string) => void
}

@DropTarget(ItemTypes.CARD, cardTarget, connect => ({
	connectDropTarget: connect.dropTarget(),
}))
@DragSource(ItemTypes.CARD, cardSource, (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging(),
}))
export default class Card extends React.Component<CardProps> {
	public static propTypes = {
		connectDragSource: PropTypes.func.isRequired,
		connectDropTarget: PropTypes.func.isRequired,
		isDragging: PropTypes.bool.isRequired,
		id: PropTypes.any.isRequired,
		text: PropTypes.string.isRequired,
		moveCard: PropTypes.func.isRequired,
	}

	public render() {
		const {
			text,
			isDragging,
			connectDragSource,
			connectDropTarget,
		} = this.props
		const opacity = isDragging ? 0 : 1

		return (
			connectDragSource &&
			connectDropTarget &&
			connectDragSource(
				connectDropTarget(<div style={{ ...style, opacity }}>{text}</div>),
			)
		)
	}
}
