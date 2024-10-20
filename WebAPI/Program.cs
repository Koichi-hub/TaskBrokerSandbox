using Microsoft.AspNetCore.Mvc;
using TaskBrokerSandbox.DataSource;
using TaskBrokerSandbox.Types;
using TaskBrokerSandbox.Workers;
using WebAPI.Hubs;
using WebAPI.Types;
using WebAPI.Workers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<TaskProcessor>();

builder.Services.AddSingleton<TaskBroker>();
builder.Services.AddSingleton<TaskMonitoring>();
builder.Services.AddSingleton<TaskCache>();

builder.Services.AddHostedService(provider => provider.GetService<TaskBroker>()!);
builder.Services.AddHostedService(provider => provider.GetService<TaskMonitoring>()!);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();

app.MapPost("/tasks", ([FromBody] AddTaskRequest addTaskRequest, [FromServices] TaskBroker taskBroker, [FromServices] TaskCache taskCache) =>
{
    if (!Enum.TryParse(addTaskRequest.TaskProcessorType, out TaskProcessorTypeEnum taskProcessorType))
    {
        throw new ArgumentException("Incorrect TaskProcessorTypeEnum value");
    }

    var taskModel = new TaskModel
    {
        Uid = addTaskRequest.Uid,
        TaskProcessorType = taskProcessorType
    };

    try
    {
        taskCache.AddTask(taskModel);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(ex.Message);
    }

    taskBroker.AssignTaskToProcessor(taskModel.Uid, taskModel.TaskProcessorType);
    return Results.Ok(taskModel);
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

app.MapHub<TaskProcessorsMonitoringHub>("/monitoringHub");

app.Run();
