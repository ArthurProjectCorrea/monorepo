using Api.Core.Entities;
using Api.Core.Interfaces;
using Api.Infrastructure.Data;
using Api.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<IStorageService, LocalStorageService>();

// 1. Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["ConnectionStrings:DefaultConnection"];

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// 3. Redis
var redisConfig = builder.Configuration["Redis:Configuration"]
    ?? builder.Configuration["REDIS_CONFIGURATION"]
    ?? "localhost:6379";
var redisOptions = ConfigurationOptions.Parse(redisConfig);
redisOptions.AbortOnConnectFail = false;

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
    ConnectionMultiplexer.Connect(redisOptions));

builder.Services.AddStackExchangeRedisCache(options =>

{
    options.Configuration = redisConfig;
    options.ConfigurationOptions = redisOptions;
});

// 4. API Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// 5. CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 6. Migrations & Seeding
if (app.Configuration["SkipSeeding"] != "true")
{

    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<AppDbContext>();
            if (context.Database.IsRelational() && context.Database.GetPendingMigrations().Any())
            {
                context.Database.Migrate();
            }

            var userManager = services.GetRequiredService<UserManager<User>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            await DbInitializer.SeedAsync(userManager, roleManager, context);
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred during database initialization.");
        }
    }
}


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Ensure wwwroot/uploads exists and is served as static files
var wwwrootPath = app.Environment.WebRootPath;
if (string.IsNullOrEmpty(wwwrootPath))
{
    wwwrootPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot");
    app.Environment.WebRootPath = wwwrootPath;
}
Directory.CreateDirectory(Path.Combine(wwwrootPath, "uploads"));
app.UseStaticFiles();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }

