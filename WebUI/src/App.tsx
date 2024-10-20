import { LineChart } from '@mui/x-charts/LineChart';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useCallback, useMemo, useState } from 'react';
import { createSignalRContext } from 'react-signalr/signalr';
import {
	getTaskProcessorsTasksList,
	getTaskProcessorTasksList,
	TestTaskType,
} from './TestTasks';
import {
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	Button,
} from '@mui/material';

dayjs.extend(utc);
const SignalRContext = createSignalRContext();
const webApiUri = 'http://localhost:5223';

const customize = {
	height: 300,
	legend: { hidden: false },
	margin: { top: 5 },
};

//Data
const keyToLabel: { [key: string]: string } = {
	countA: 'Задачи типа A',
	countB: 'Задачи типа B',
	countC: 'Задачи типа C',
};

const taskProcessorsColors: { [key: string]: string } = {
	countA: 'red',
	countB: 'green',
	countC: 'blue',
};

// eslint-disable-next-line react-refresh/only-export-components
export enum TaskProcessorTypeEnum {
	A,
	B,
	C,
}

type TaskProcessorMonitoringDataType = {
	[key in keyof typeof TaskProcessorTypeEnum]?: number;
};

type MonitoringDataType = {
	CreatedAt: Date;
	TaskProcessorsMonitoringData: TaskProcessorMonitoringDataType;
	TotalTasksCount: number;
	ProcessingTasksCount: number;
	CompletedTasksCount: number;
};

type TaskProcessorsDataType = {
	date: Date;
	countA: number;
	countB: number;
	countC: number;
};

type TasksDataType = {
	TotalTasksCount: number;
	ProcessingTasksCount: number;
	CompletedTasksCount: number;
};

enum AddTasksMode {
	All,
	A,
	B,
	C,
}

export const App = () => {
	const [addTasksMode, setAddTasksMode] = useState<AddTasksMode>(
		AddTasksMode.All
	);
	const [taskProcessorDataList, setTaskProcessorsDataList] = useState<
		TaskProcessorsDataType[]
	>([]);
	const [tasksData, setTasksData] = useState<TasksDataType>({
		TotalTasksCount: 0,
		ProcessingTasksCount: 0,
		CompletedTasksCount: 0,
	});

	const onClickAddTasks = useCallback(async () => {
		let tasks: TestTaskType[] = [];

		if (addTasksMode === AddTasksMode.All) {
			tasks = getTaskProcessorsTasksList();
		} else {
			let taskProcessorType = TaskProcessorTypeEnum.A;
			switch (addTasksMode) {
				case AddTasksMode.A:
					taskProcessorType = TaskProcessorTypeEnum.A;
					break;
				case AddTasksMode.B:
					taskProcessorType = TaskProcessorTypeEnum.B;
					break;
				case AddTasksMode.C:
					taskProcessorType = TaskProcessorTypeEnum.C;
					break;
				default:
					break;
			}
			tasks = getTaskProcessorTasksList(taskProcessorType);
		}

		Promise.all(
			tasks.map((task) =>
				fetch(`${webApiUri}/tasks`, {
					method: 'POST',
					body: JSON.stringify(task),
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
					},
				})
			)
		);
	}, [addTasksMode]);

	const onChangeAddTasksMode = (event: React.ChangeEvent<HTMLInputElement>) => {
		setAddTasksMode(
			Number((event.target as HTMLInputElement).value) as AddTasksMode
		);
	};

	SignalRContext.useSignalREffect(
		'ReceiveMonitoringData',
		(message) => {
			const monitoringData = JSON.parse(message) as MonitoringDataType;

			const date = dayjs.utc(monitoringData.CreatedAt).local().toDate();

			const taskProcessorAData: TaskProcessorsDataType = {
				date,
				countA: monitoringData.TaskProcessorsMonitoringData['A'] as number,
				countB: monitoringData.TaskProcessorsMonitoringData['B'] as number,
				countC: monitoringData.TaskProcessorsMonitoringData['C'] as number,
			};

			setTaskProcessorsDataList((prevDataList) => {
				if (prevDataList.length >= 70) {
					return [
						...prevDataList.slice(1, prevDataList.length),
						taskProcessorAData,
					];
				}
				return [...prevDataList, taskProcessorAData];
			});

			setTasksData({
				TotalTasksCount: monitoringData.TotalTasksCount,
				ProcessingTasksCount: monitoringData.ProcessingTasksCount,
				CompletedTasksCount: monitoringData.CompletedTasksCount,
			});
		},
		[]
	);

	const renderChart = useMemo(() => {
		const now = dayjs();
		return (
			<LineChart
				xAxis={[
					{
						dataKey: 'date',
						scaleType: 'time',
						valueFormatter: (date) => dayjs(date).format('HH:mm:ss'),
						min: now.subtract(1, 'minute').toDate(),
						max: now.toDate(),
					},
				]}
				series={Object.keys(keyToLabel).map((key) => ({
					dataKey: key,
					label: keyToLabel[key],
					color: taskProcessorsColors[key],
					showMark: false,
				}))}
				dataset={taskProcessorDataList}
				{...customize}
			/>
		);
	}, [taskProcessorDataList]);

	const renderTasksData = useMemo(() => {
		return (
			<div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
				<span>Всего: {tasksData.TotalTasksCount}</span> |
				<span>В процессе: {tasksData.ProcessingTasksCount}</span> |
				<span>Выполнено: {tasksData.CompletedTasksCount}</span>
			</div>
		);
	}, [tasksData]);

	return (
		<SignalRContext.Provider
			withCredentials={false}
			url={`${webApiUri}/monitoringHub`}
		>
			<div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
				<Button variant="outlined" onClick={onClickAddTasks}>
					Добавить задачи
				</Button>
				<FormControl>
					<FormLabel id="demo-row-radio-buttons-group-label">
						Типы задач
					</FormLabel>
					<RadioGroup
						row
						aria-labelledby="demo-row-radio-buttons-group-label"
						name="row-radio-buttons-group"
						value={addTasksMode}
						onChange={onChangeAddTasksMode}
					>
						<FormControlLabel
							value={AddTasksMode.All}
							control={<Radio />}
							label="Все"
						/>
						<FormControlLabel
							value={AddTasksMode.A}
							control={<Radio />}
							label="A"
						/>
						<FormControlLabel
							value={AddTasksMode.B}
							control={<Radio />}
							label="B"
						/>
						<FormControlLabel
							value={AddTasksMode.C}
							control={<Radio />}
							label="C"
						/>
					</RadioGroup>
				</FormControl>
				{renderTasksData}
			</div>
			{renderChart}
		</SignalRContext.Provider>
	);
};
