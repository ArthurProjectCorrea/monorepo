
namespace Api.Core.Interfaces;

public interface IPermissionService
{
    Task<bool> HasPermissionAsync(string sessionId, string screenKey, string actionId);
}
