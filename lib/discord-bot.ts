import {
  Client,
  GatewayIntentBits,
  TextChannel,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js"
import prisma from "./db"

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
})

// Bot token from environment variables
const token = process.env.DISCORD_BOT_TOKEN

// Initialize the bot
export async function initializeBot() {
  if (!token) {
    console.warn("Discord bot token not provided. Bot functionality will be disabled.")
    return null
  }

  try {
    await client.login(token)
    console.log("Discord bot connected successfully")

    client.on("ready", () => {
      console.log(`Logged in as ${client.user?.tag}`)
    })

    // Set up event handlers
    setupEventHandlers()

    return client
  } catch (error) {
    console.error("Failed to initialize Discord bot:", error)
    return null
  }
}

// Set up event handlers
function setupEventHandlers() {
  // Handle button interactions
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return

    const [action, applicationId] = interaction.customId.split(":")

    if (action === "approve" || action === "reject" || action === "interview") {
      try {
        // Get the application
        const application = await prisma.application.findUnique({
          where: { id: applicationId },
          include: {
            user: true,
            village: true,
            clan: true,
          },
        })

        if (!application) {
          await interaction.reply({ content: "Application not found", ephemeral: true })
          return
        }

        // Update application status
        const status = action === "approve" ? "ACCEPTED" : action === "reject" ? "REJECTED" : "INTERVIEW"

        await prisma.application.update({
          where: { id: applicationId },
          data: { status },
        })

        // Add comment
        await prisma.comment.create({
          data: {
            applicationId,
            content: `Application ${status.toLowerCase()} by ${interaction.user.tag} via Discord`,
            sentToDiscord: true,
          },
        })

        // Reply to the interaction
        await interaction.reply({
          content: `Application ${status.toLowerCase()} successfully`,
          ephemeral: true,
        })

        // Update the original message
        const embed = new EmbedBuilder()
          .setTitle(`Application ${status}`)
          .setDescription(`Application from ${application.user.username} has been ${status.toLowerCase()}`)
          .setColor(status === "ACCEPTED" ? "#00ff00" : status === "REJECTED" ? "#ff0000" : "#0099ff")
          .addFields(
            { name: "User", value: application.user.username, inline: true },
            { name: "Village", value: application.village.name, inline: true },
            { name: "Clan", value: application.clan?.name || "None", inline: true },
            { name: "Status", value: status, inline: true },
            { name: "Action By", value: interaction.user.tag, inline: true },
          )
          .setTimestamp()

        await interaction.message.edit({
          embeds: [embed],
          components: [], // Remove buttons
        })

        // If accepted, assign roles in Discord
        if (status === "ACCEPTED" && application.user.discordId) {
          await assignDiscordRoles(application)
        }
      } catch (error) {
        console.error("Error handling button interaction:", error)
        await interaction.reply({
          content: "An error occurred while processing the application",
          ephemeral: true,
        })
      }
    }
  })
}

// Send application notification to Discord
export async function sendApplicationNotification(application) {
  if (!client || !client.isReady()) return

  try {
    // Get settings
    const settings = await getDiscordSettings()
    if (!settings.discordBotEnabled || !settings.discordApplicationsChannelId) return

    // Get the channel
    const channel = await client.channels.fetch(settings.discordApplicationsChannelId)
    if (!channel || !(channel instanceof TextChannel)) return

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle("New Application")
      .setDescription(`A new application has been submitted by ${application.user.username}`)
      .setColor("#0099ff")
      .addFields(
        { name: "User", value: application.user.username, inline: true },
        { name: "Village", value: application.village.name, inline: true },
        { name: "Clan", value: application.clan?.name || "None", inline: true },
        { name: "Biography", value: application.biography || "No biography provided" },
      )
      .setTimestamp()

    // Create buttons
    const approveButton = new ButtonBuilder()
      .setCustomId(`approve:${application.id}`)
      .setLabel("Approve")
      .setStyle(ButtonStyle.Success)

    const rejectButton = new ButtonBuilder()
      .setCustomId(`reject:${application.id}`)
      .setLabel("Reject")
      .setStyle(ButtonStyle.Danger)

    const interviewButton = new ButtonBuilder()
      .setCustomId(`interview:${application.id}`)
      .setLabel("Interview")
      .setStyle(ButtonStyle.Primary)

    const row = new ActionRowBuilder().addComponents(approveButton, interviewButton, rejectButton)

    // Send message
    await channel.send({
      embeds: [embed],
      components: [row],
    })
  } catch (error) {
    console.error("Error sending application notification to Discord:", error)
  }
}

// Assign Discord roles based on village and clan
async function assignDiscordRoles(application) {
  if (!client || !client.isReady()) return

  try {
    // Get settings
    const settings = await getDiscordSettings()
    if (!settings.discordBotEnabled || !settings.discordServerId) return

    // Get the guild
    const guild = await client.guilds.fetch(settings.discordServerId)
    if (!guild) return

    // Get the member
    const member = await guild.members.fetch(application.user.discordId)
    if (!member) return

    // Get village and clan roles
    const villageRole = guild.roles.cache.find(
      (role) => role.name.toLowerCase() === application.village.name.toLowerCase(),
    )

    const clanRole = application.clan
      ? guild.roles.cache.find((role) => role.name.toLowerCase() === application.clan.name.toLowerCase())
      : null

    // Assign roles
    if (villageRole) {
      await member.roles.add(villageRole)
    }

    if (clanRole) {
      await member.roles.add(clanRole)
    }

    // Add "Verified" role
    const verifiedRole = guild.roles.cache.find((role) => role.name.toLowerCase() === "verified")

    if (verifiedRole) {
      await member.roles.add(verifiedRole)
    }
  } catch (error) {
    console.error("Error assigning Discord roles:", error)
  }
}

// Get Discord settings from database
async function getDiscordSettings() {
  try {
    const settingsRecords = await prisma.setting.findMany({
      where: {
        key: {
          in: ["discordBotEnabled", "discordServerId", "discordApplicationsChannelId", "discordAnnouncementsChannelId"],
        },
      },
    })

    const settings = settingsRecords.reduce((acc, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value)
      } catch (e) {
        acc[setting.key] = setting.value
      }
      return acc
    }, {})

    return settings
  } catch (error) {
    console.error("Error getting Discord settings:", error)
    return {}
  }
}

// Initialize the bot when this module is imported
initializeBot()

export default client

