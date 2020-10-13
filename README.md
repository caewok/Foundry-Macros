# Macros for Foundry VTT

A collection of macros for the excellent [Foundry VTT](https://foundryvtt.com/article/macros/).

## Award XP
Select one or more characters. If no characters are selected, the macro will use all PCs.

The dialog permits you to enter total xp or individual xps and vary the weights. On confirmation, the macro applies the xp to each character and outputs a summary to a chat message.

## Calculate Encounter XP

Basic XP calculator. Select one or more creatures. Adds up the XP; allows you to de-select or add additional xp for each creature. Ignores PCs.

## Greyhawk Initiative

Polls the list of combatants in the combat tracker. If you own more than one combatant, a dialog will ask you to select one or more. (All entities selected will use the same actions but not necessarily the same rolls.) 

Then a dialog asks for a set of actions based on [Unearthed Arcana Greyhawk Initiative rules](https://media.wizards.com/2017/dnd/downloads/UAGreyhawkInitiative.pdf) and rolls initiative accordingly. Assumes you installed a [module to reverse initiative](https://github.com/wakeand/fvtt-module-reverseinitiativeorder). 

## Grit & Glory 

### Roll Injury Tokens

Follows the Grit & Glory injury rules. Select a single actor on the map. A dialog asks the user to enter the number of injury tokens and the injury type. It first rolls on the relevant severity table and then, based on the severity table result, makes the specified roll type on the relevant injury table. Displays both rolls to the chat.

Requires that the user first set up roll tables, one for each severity level and one for each damage type. See the macro for the naming, which can be modified. The macro assumes the severity table results uses the language specified in Grit & Glory severity tables. 

### Raise Shield

Follows the Grit & Glory melee reaction rule to raise shield to gain +2 to AC against the specific attack. Shield is damaged by -1 AC in the process. The macro finds the actor's shield, asks if more than 1, and decreases the shield AC accordingly. 