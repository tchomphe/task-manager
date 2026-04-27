namespace TaskManager.Api.Middleware;

public class NotFoundException(string message) : Exception(message) { }
