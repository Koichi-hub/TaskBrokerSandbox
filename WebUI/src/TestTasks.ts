import { v4 } from 'uuid';
import { TaskProcessorTypeEnum } from './App';
import random from 'random';

export type TestTaskType = {
	Uid: string;
	TaskProcessorType: string;
};

export const getTaskProcessorsTasksList = () => {
	const tasks: TestTaskType[] = [];
	const taskProcessorTypes = Object.values(TaskProcessorTypeEnum).filter(
		(x) => typeof x == 'string'
	) as string[];

	for (let i = 0; i < random.int(10, 100); i++) {
		tasks.push({
			Uid: v4(),
			TaskProcessorType: random.choice(taskProcessorTypes) as string,
		});
	}

	return tasks;
};

export const getTaskProcessorTasksList = (
	taskProcessorType: TaskProcessorTypeEnum
) => {
	const tasks: TestTaskType[] = [];

	for (let i = 0; i < random.int(10, 100); i++) {
		tasks.push({
			Uid: v4(),
			TaskProcessorType: TaskProcessorTypeEnum[taskProcessorType],
		});
	}

	return tasks;
};
