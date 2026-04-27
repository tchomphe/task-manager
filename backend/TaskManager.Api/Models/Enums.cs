using System.Text.Json.Serialization;

namespace TaskManager.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TaskItemStatus { Todo, InProgress, Done }

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Priority { Low, Medium, High }
