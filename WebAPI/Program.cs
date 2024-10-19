using Microsoft.AspNetCore.Mvc;
using TaskBrokerSandbox.DataSource;
using TaskBrokerSandbox.Types;
using TaskBrokerSandbox.Workers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<TaskProcessor>();

builder.Services.AddSingleton<TaskBroker>();
builder.Services.AddSingleton<TaskCache>();

builder.Services.AddHostedService(provider => provider.GetService<TaskBroker>()!);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.MapPost("/tasks", ([FromQuery] TaskProcessorTypeEnum taskProcessorType, [FromServices] TaskBroker taskBroker, [FromServices] TaskCache taskCache) =>
{
    var taskModel = new TaskModel
    {
        Uid = Guid.NewGuid(),
        TaskProcessorType = taskProcessorType
    };
    taskCache.AddTask(taskModel);
    taskBroker.AssignTaskToProcessor(taskModel.Uid, taskProcessorType);
    return taskModel;
})
.WithOpenApi();

app.MapGet("/tasks/{taskUid}", ([FromRoute] Guid taskUid, [FromServices] TaskCache taskCache) =>
{
    return taskCache.GetTask(taskUid);
})
.WithOpenApi();

app.MapGet("/tasks", ([FromServices] TaskCache taskCache) =>
{
    return taskCache.GetTasks();
})
.WithOpenApi();

app.Run();
