import { APIGatewayEvent, Callback, Context } from "aws-lambda"
import { config } from "dotenv"
import { parse } from "query-string"
import { LogLevel, WebClient } from "@slack/client"




config()



const handler = ( event: APIGatewayEvent, context: Context, callback: Callback ): Promise<Response> => {
	
	const action: SlackUserAction<{ tool: string, email: string, team_name: string, slack_user: string }> = _extractFormData( event.body ),
	      client                                                                                          = new WebClient( process.env.SLACK_TOKEN, { logLevel: LogLevel.DEBUG } )
	
	
	return handleAction()
	
	
	// Private helpers
	function _actionTypeNotHandled()
	{
		return [ "message_action", "dialog_submission" ].indexOf( action.type ) < 0
	}
	
	
	function handleAction()
	{
		if ( _actionTypeNotHandled() )
			return cancel( action )
		
		return _getActionHandler( action.type )( action, client )
	}
	
	
	function _getActionHandler( actionType: string )
	{
		const handlers: { [ action_type: string ]: actionHandler } = {
			message_action:    handleUserClickedAccountCreationButton,
			dialog_submission: handleAccountCreationSubmission,
		}
		
		return handlers[ actionType ]
	}
	
	
	function _extractFormData( body: Maybe<string> )
	{
		const { payload } = (parse( body || "payload=" ) as { payload: string })
		
		return JSON.parse( payload ) // payload return a json string even after parse
	}
	
	
	function cancel( action: UserTriggeredAction ): Promise<Response>
	{
		return Promise.resolve( {
			statusCode: 200,
			body:       JSON.stringify( { error: { message: `Action [${action.type}] not handled` } } ),
		} )
	}
}

//
// 😍 Handlers
function handleUserClickedAccountCreationButton( action: DialogTriggeredAction, client: WebClient ): Promise<Response>
{
	return (
		(action.message as botMessageInfos).subtype ?// it's a bot message, we can't create accounts for those
		Promise.resolve() :
		_sendDialog( action )
	)
		.then( res => ({
			statusCode: 200,
			body:       "",
		}) )
	
	
	function cancel()
	{
		return Promise.resolve()
	}
	
	
	function _sendDialog( action: DialogTriggeredAction ): Promise<any>
	{
		return client.dialog.open( {
			trigger_id: action.trigger_id,
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
								value: "cault",
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
						value: (action.message as userMessageInfos).user,
					},
				],
			},
		} )
		
	}
}


function handleAccountCreationSubmission( action: DialogSubmitedAction<{ tool: string; email: string; team_name: string; slack_user: string }>, client: WebClient ): Promise<Response>
{
	// Is it dialog submit
	// -> Send me the user's infos (this is for demo)
	//    -> Find out who triggered the actions
	//    -> Get his infos
	//    -> Post message to his id
	// -> send dm
	//    -> "Hey dude, your account has bee created"
	//    -> gif
	// -> Track creation
	// Send poll
	
	const { slack_user: asker, email, team_name, tool } = action.submission,
	      instantiator                                  = action.user.id
	
	const sendCredentialsToUser = client.chat.postMessage( {
		channel: asker,
		// Will only appear in notification as we're using blocks
		text:    `${tool} account created `,
		// icon_emoji: ":raised_hands:",
		blocks:  [
			{
				type:      "section",
				text:      {
					type: "mrkdwn",
					text: `Hey ${asker}, your ${tool} account has been created, here are your credentials [++ SEND A POLL ++]`,
				},
				accessory: {
					type:      "image",
					image_url: "https://media.giphy.com/media/wAxlCmeX1ri1y/giphy.gif",
					alt_text:  "Victory",
				},
			},
		],
		// as_user:  true, // I don't receive notifications if i send myself a dm 😅
		// username: "isthatcentered",
	} )
	
	const sendActionSuccessConfirmationToInstantiator = client.chat.postEphemeral( {
		channel: action.channel.id,
		user:    action.user.id,
		text:    "Success, account has been created and sent",
	} )
	
	// const sendUserInfosToInstantiator = client.users.info( { user: asker } )
	// 	.then( ( { user }: any ) => client.chat.postMessage( {
	// 			channel: instantiator,
	// 			text:    `Here's what we got on this guy: name: ${user.name}`,
	// 		} ),
	// 	)
	
	return Promise.all( [
			sendCredentialsToUser,
			sendActionSuccessConfirmationToInstantiator, // yeah yeah this can arrive before but we're faking it so it's ok
			// sendUserInfosToInstantiator,
		] )
		.then( res => ({
			statusCode: 200,
			body:       "",
		}) )
}


export type actionHandler = ( action: any, client: WebClient ) => Promise<Response>

export type SlackUserAction<T> = DialogTriggeredAction | DialogSubmitedAction<T>

// see https://api.slack.com/actions
export interface UserTriggeredAction
{
	type: string // Provided by slack, identifies the incomming action
	token: string
	action_ts: string
	callback_id: string // you defined this in app settings https://api.slack.com/apps/AGG0QS9PZ/interactive-messages?
	// The user who clicked on the action to trigger this request
	user: {
		name: string
		id: string
	}
	// Team the source message was in
	team: {
		domain: string
		id: string
	}
	// Channel the source message was in
	channel: {
		name: string
		id: string
	}
	response_url: string // If you want to respond to the action with a message after receiving the payload
}

export interface DialogTriggeredAction extends UserTriggeredAction
{
	type: "message_action" // provided by slack
	callback_id: "account_new" // you defined this in app settings https://api.slack.com/apps/AGG0QS9PZ/interactive-messages?
	trigger_id: string
	message_ts: string
	// The message that the user initiated the action with.
	message: botMessageInfos | userMessageInfos
}

export interface messageInfos
{
	type: "message",
	text: string,
	ts: string,
}

export interface botMessageInfos extends messageInfos
{
	subtype: "bot_message",
	username: string,
	bot_id: string,
}

export interface userMessageInfos extends messageInfos
{
	client_msg_id: string,
	user: string,
}



export interface DialogSubmitedAction<T>  extends UserTriggeredAction
{
	type: "dialog_submission",
	submission: T,
	state: string
}


export type Maybe<T> = T | null | undefined


interface Response
{
	headers?: { [ key: string ]: string }
	statusCode: number
	body?: string
}


export { handler }