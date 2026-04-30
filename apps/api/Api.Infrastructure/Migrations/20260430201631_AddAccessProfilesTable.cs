using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAccessProfilesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AccessProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccessProfiles_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AccessProfilePermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AccessProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScreenId = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccessProfilePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccessProfilePermissions_AccessProfiles_AccessProfileId",
                        column: x => x.AccessProfileId,
                        principalTable: "AccessProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AccessProfilePermissions_Screens_ScreenId",
                        column: x => x.ScreenId,
                        principalTable: "Screens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccessProfilePermissions_AccessProfileId_ScreenId_ActionId",
                table: "AccessProfilePermissions",
                columns: new[] { "AccessProfileId", "ScreenId", "ActionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AccessProfilePermissions_ScreenId",
                table: "AccessProfilePermissions",
                column: "ScreenId");

            migrationBuilder.CreateIndex(
                name: "IX_AccessProfiles_ClientId",
                table: "AccessProfiles",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_AccessProfiles_Name_ClientId",
                table: "AccessProfiles",
                columns: new[] { "Name", "ClientId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccessProfilePermissions");

            migrationBuilder.DropTable(
                name: "AccessProfiles");
        }
    }
}
