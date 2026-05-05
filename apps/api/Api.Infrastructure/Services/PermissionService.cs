
using Api.Core.Interfaces;
using StackExchange.Redis;
using System.Text.Json;

namespace Api.Infrastructure.Services;

public class PermissionService : IPermissionService
{
    private readonly IDatabase _redis;

    public PermissionService(IConnectionMultiplexer redis)
    {
        _redis = redis.GetDatabase();
    }

    public async Task<bool> HasPermissionAsync(string sessionId, string screenKey, string actionId)
    {
        if (string.IsNullOrEmpty(sessionId)) return false;

        var sessionJson = await _redis.StringGetAsync($"session:{sessionId}");
        if (!sessionJson.HasValue) return false;

        try
        {
            var sessionData = JsonSerializer.Deserialize<JsonElement>((string)sessionJson!);
            if (sessionData.TryGetProperty("me", out var me))
            {
                if (me.TryGetProperty("accesses", out var accesses))
                {
                    foreach (var access in accesses.EnumerateArray())
                    {
                        if (access.TryGetProperty("access_profiles", out var profiles))
                        {
                            foreach (var profile in profiles.EnumerateArray())
                            {
                                if (profile.TryGetProperty("permissions", out var permissions))
                                {
                                    foreach (var permission in permissions.EnumerateArray())
                                    {
                                        if (permission.TryGetProperty("screen_key", out var key) && key.GetString() == screenKey)
                                        {
                                            if (permission.TryGetProperty("actions", out var actions))
                                            {
                                                foreach (var action in actions.EnumerateArray())
                                                {
                                                    if (action.TryGetProperty("key", out var actionKey) && actionKey.GetString() == actionId)
                                                    {
                                                        return true;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        catch
        {
            return false;
        }

        return false;
    }
}
