import { botMessageInfos, EventHandler, Response, userClickedAccountCreationButton, userMessageInfos, userSubmittedDialog } from "./contracts"
import { WebClient } from "@slack/client"
//@ts-ignore
import * as Airtable from "airtable"




export function makeEventHandler( event: userClickedAccountCreationButton | userSubmittedDialog, client: WebClient ): EventHandler
{
	
	switch ( event.type ) {
		case "message_action":
			return new RequestUserInformationsForAccountCreation( event, client )
		
		case "dialog_submission":
			return new CreateDesiredAccount( event, client )
		
		default:
			return new NullEventHandler()
	}
}


export class NullEventHandler implements EventHandler
{
	handle(): Promise<Response>
	{
		return Promise.resolve( {
			statusCode: 200,
			body:       "",
		} )
	}
}

export class RequestUserInformationsForAccountCreation implements EventHandler
{
	private readonly _event: userClickedAccountCreationButton
	private readonly _client: WebClient
	
	
	constructor( event: userClickedAccountCreationButton, client: WebClient )
	{
		this._event = event
		this._client = client
	}
	
	
	handle()
	{
		if ( this._wasTriggeredOnBotUser() )
			return new NullEventHandler().handle()
		
		return this._triggerAccountCreationDialog()
			.then( () => ({
				statusCode: 200,
				body:       "success",
			}) )
	}
	
	
	private _wasTriggeredOnBotUser(): boolean
	{
		return !!(this._event.message as botMessageInfos).subtype
	}
	
	
	private _triggerAccountCreationDialog()
	{
		return this._client.dialog.open( {
			trigger_id: this._event.trigger_id,
			dialog:     {
				title:            "Create account",
				callback_id:      Math.random().toString(), // An identifier strictly for you to recognize submissions of this particular instance of a dialog. Use something meaningful to your app. 255 characters maximum. Don't use this ID to reference sensitive data; use the more expansive state parameter
				notify_on_cancel: false, // 	Default is false. When set to true, we'll notify your request URL whenever there's a user-induced dialog cancellation
				submit_label:     "Create",
				state:            "", // 	An optional string that will be echoed back to your app when a user interacts with your dialog. Use it as a pointer to reference sensitive data stored elsewhere.
				elements:         [
					{
						label:   "Tool",
						type:    "select",
						name:    "tool",
						options: [
							{
								label: "Github",
								value: "github",
							},
							{
								label: "Gitlab",
								value: "gitlab",
							},
							{
								label: "Artifactory",
								value: "artifactory",
							},
							{
								label: "Vault",
								value: "vault",
							},
							{
								label: "Jira",
								value: "jira",
							},
						],
					},
					{
						label:       "Email address",
						name:        "email",
						type:        "text",
						subtype:     "email",
						placeholder: "you@example.com",
					},
					{
						label:       "Team name",
						name:        "team_name",
						type:        "text",
						placeholder: "software-factory",
					},
					{
						label: "Slack user",
						name:  "slack_user",
						type:  "text",
						value: (this._event.message as userMessageInfos).user,
					},
				],
			},
		} )
	}
}

export class CreateDesiredAccount implements EventHandler
{
	private readonly __event: userSubmittedDialog
	private readonly __client: WebClient
	
	
	constructor( event: userSubmittedDialog, client: WebClient )
	{
		this.__event = event
		this.__client = client
	}
	
	
	handle()
	{
		return this._trackInAirtable()
			.then( () => this._sendCredentialsToUser() )
			.then( () => this._sendSuccessConfirmationToInstantiator() )
			.then( () => new NullEventHandler().handle() )
	}
	
	
	private _sendCredentialsToUser()
	{
		const { slack_user: asker, email, team_name, tool } = this.__event.submission
		
		return this.__client.chat.postMessage( {
			channel: asker,
			text:    `Your ${tool} account was created `, // Will only appear in notification as we're using blocks
			blocks:  [
				{
					type:      "section",
					text:      {
						type: "mrkdwn",
						text: `Hey ${asker}, your ${tool} account has been created, here are your credentials [++ SEND A POLL ++]`,
					},
					accessory: {
						type:      "image",
						image_url: "https://media.giphy.com/media/26xBwxkVDRifsqjHW/giphy.gif",
						alt_text:  "Victory",
					},
				},
			],
			// as_user:  true, // I don't receive notifications if i send myself a dm 😅
			// username: "isthatcentered",
		} )
	}
	
	
	private _trackInAirtable()
	{
		const { email, tool } = this.__event.submission,
		      sheet           = new Airtable( { apiKey: process.env.AIRTABLE_API_KEY } ).base( "appz0LgWqXvt4BkwE" );
		
		const record = {
			Date: new Date( Date.now() ).toISOString(),
			Tool: tool,
			User: email,
		}
		
		return new Promise( ( resolve, reject ) => {
			sheet( "Table 1" )
				.create( record, { typecast: true }, function ( err: any, record: any ) {
					if ( err )
						reject( err )
					
					resolve( record )
				} );
		} )
	}
	
	
	private _sendSuccessConfirmationToInstantiator()
	{
		const { slack_user: email, tool } = this.__event.submission,
		      instantiator                = this.__event.user.id
		
		return this.__client.chat.postEphemeral( {
			channel: this.__event.channel.id,
			user:    instantiator,
			text:    `Success, ${email}'s ${tool} account has been created and sent`,
		} )
	}
}