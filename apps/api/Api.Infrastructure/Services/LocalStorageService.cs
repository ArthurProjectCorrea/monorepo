using Api.Core.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace Api.Infrastructure.Services;

public class LocalStorageService : IStorageService
{
    private readonly IWebHostEnvironment _environment;

    public LocalStorageService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    private string GetUploadsRoot(string folder)
    {
        // Prefer WebRootPath if available, fall back to ContentRootPath/wwwroot
        var root = !string.IsNullOrEmpty(_environment.WebRootPath)
            ? _environment.WebRootPath
            : Path.Combine(_environment.ContentRootPath, "wwwroot");

        var uploadsFolder = Path.Combine(root, folder);

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        return uploadsFolder;
    }

    public async Task<string> SaveFileAsync(Stream content, string fileName, string folder = "uploads")
    {
        var uploadsFolder = GetUploadsRoot(folder);

        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await content.CopyToAsync(fileStream);
        }

        return $"/{folder}/{uniqueFileName}";
    }

    public Task DeleteFileAsync(string? fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl)) return Task.CompletedTask;

        var root = !string.IsNullOrEmpty(_environment.WebRootPath)
            ? _environment.WebRootPath
            : Path.Combine(_environment.ContentRootPath, "wwwroot");

        var relativePath = fileUrl.StartsWith("/") ? fileUrl.Substring(1) : fileUrl;
        var filePath = Path.Combine(root, relativePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }
}
