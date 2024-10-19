import { LineChart } from '@mui/x-charts/LineChart';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useMemo, useState } from 'react';
import { createSignalRContext } from 'react-signalr/signalr';

dayjs.extend(utc);
const SignalRContext = createSignalRContext();

const stackStrategy = {
	stack: 'total',
	area: false,
	stackOffset: 'none', // To stack 0 on top of others
} as const;

const customize = {
	height: 300,
	legend: { hidden: true },
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum TaskProcessorTypeEnum {
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
};

type TaskProcessorsDataType = {
	date: Date;
	countA: number;
	countB: number;
	countC: number;
};

export const App = () => {
	const [taskProcessorDataList, setTaskProcessorsDataList] = useState<
		TaskProcessorsDataType[]
	>([]);

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
				if (prevDataList.length >= 100) {
					return [
						...prevDataList.slice(1, prevDataList.length),
						taskProcessorAData,
					];
				}
				return [...prevDataList, taskProcessorAData];
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
					...stackStrategy,
				}))}
				dataset={taskProcessorDataList}
				{...customize}
			/>
		);
	}, [taskProcessorDataList]);

	return (
		<SignalRContext.Provider
			withCredentials={false}
			url={'http://localhost:5223/monitoringHub'}
		>
			{renderChart}
		</SignalRContext.Provider>
	);
};
