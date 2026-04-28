namespace Api.Core.Interfaces;

public interface IStorageService
{
    Task<string> SaveFileAsync(Stream content, string fileName, string folder = "uploads");
    Task DeleteFileAsync(string? fileUrl);
}
