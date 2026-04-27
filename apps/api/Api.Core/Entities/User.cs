using Microsoft.AspNetCore.Identity;

namespace Api.Core.Entities;

public class User : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
}
