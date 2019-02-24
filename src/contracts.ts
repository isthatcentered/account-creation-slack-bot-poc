export interface slackEvent
{
	type: string
	callback_id: string // you defined this in app settings https://api.slack.com/apps/AGG0QS9PZ/interactive-messages?
	user: userIdentification // The user who clicked on the action to trigger this request
	team: teamIdentification // Team the source message was in
	channel: channelIdentification // Channel the source message was in
	response_url: string // If you want to respond to the action with a message after receiving the payload
}

export interface unknownSlackEvent extends slackEvent
{

}

export interface userClickedAccountCreationButton extends slackEvent
{
	type: "message_action" // provided by slack
	callback_id: "account_new" // you defined this in app settings https://api.slack.com/apps/AGG0QS9PZ/interactive-messages?
	trigger_id: string // Used by slack to identify the origin and send a matching response
	message_ts: string
	message: botMessageInfos | userMessageInfos // The message that the user initiated the action with.
}

export interface userSubmittedDialog extends slackEvent
{
	type: "dialog_submission"
	submission: any
	state: string
}

export interface channelIdentification
{
	name: string
	id: string
}

export interface userIdentification
{
	name: string
	id: string
}

export interface teamIdentification
{
	domain: string
	id: string
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

export type Maybe<T> = T | null | undefined

export interface Response
{
	headers?: { [ key: string ]: string }
	statusCode: number
	body?: string
}

export interface EventHandler
{
	handle: () => Promise<Response>
}