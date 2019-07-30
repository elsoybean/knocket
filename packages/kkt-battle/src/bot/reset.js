//@flow

const reset = (bot: Bot) => {
  bot.defending = false;
  bot.attacking = false;
};

export default reset;
