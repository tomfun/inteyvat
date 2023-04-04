import { Scenes, Context } from 'telegraf';
import { URL } from 'url';

type IAdminFormData = {
  chatId?: number;
  userName?: string;
  userTag?: string;
  time?: string;
  knowledge?: string;
  topics?: string;
  post?: string;
  image?: Promise<URL>;
};

interface WizardSession extends Scenes.WizardSessionData {
  form: IAdminFormData;
}

export interface TelegrafContext extends Context {
  scene: Scenes.SceneContextScene<TelegrafContext, WizardSession>;
  wizard: Scenes.WizardContextWizard<TelegrafContext>;
}
