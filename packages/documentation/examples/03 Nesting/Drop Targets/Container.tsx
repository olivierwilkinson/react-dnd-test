import React from 'react'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import Dustbin from './Dustbin'
import Box from './Box'

@DragDropContext(HTML5Backend)
export default class Container extends React.Component {
	public state = {
		syllabus: {
			id: '1',
			type: 'group',
			contents: [
				{ id: '2', type: 'worksheet' },
				{ id: '3', type: 'group', contents: [
					{ id: '4', type: 'worksheet' },
					{ id: '5', type: 'worksheet' },
				] },
				{ id: '6', type: 'group', contents: [
					{ id: '7', type: 'worksheet' },
					{ id: '8', type: 'worksheet' },
					{ id: '9', type: 'group', contents: [
						{ id: '10', type: 'worksheet' },
						{ id: '11', type: 'worksheet' },
					] },
				] },
			],
		}
	}

	public render() {
		return (
			<div>
				<div style={{ overflow: 'hidden', clear: 'both', margin: '-1rem' }}>
					<Dustbin
						dustbinRef={(ref) => this.dustbinRef = ref}
						item={this.state.syllabus}
						greedy={true}
					/>
					{/* {this.state.syllabus.contents.map((item, index) => (
						<Dustbin
							item={item}
							greedy={item.type === 'group'}
							onStateUpdate={(child) => {
								this.setState({
									syllabus: {
										...this.state.syllabus,
										contents: [
											...this.state.syllabus.contents.slice(0, index),
											child,
											...this.state.syllabus.contents.slice(index + 1),
										]
									},
								});
							}}
						/>
					))} */}
				</div>

				<div
					style={{ overflow: 'hidden', clear: 'both', marginTop: '1.5rem' }}
					onClick={() => {
						console.log(this.dustbinRef.reconcileState());
						
						this.setState({
							syllabus: this.dustbinRef.reconcileState(),
						})
					}}
				>
					<Box />
				</div>
			</div>
		)
	}
}
