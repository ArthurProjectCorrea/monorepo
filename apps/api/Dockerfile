FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY ["apps/api/Api.slnx", "apps/api/"]
COPY ["apps/api/Api.Web/Api.Web.csproj", "apps/api/Api.Web/"]
COPY ["apps/api/Api.Core/Api.Core.csproj", "apps/api/Api.Core/"]
COPY ["apps/api/Api.Infrastructure/Api.Infrastructure.csproj", "apps/api/Api.Infrastructure/"]
RUN dotnet restore "apps/api/Api.Web/Api.Web.csproj"
COPY apps/api/ apps/api/
WORKDIR "/src/apps/api/Api.Web"
RUN dotnet build "Api.Web.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Api.Web.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Api.Web.dll"]
