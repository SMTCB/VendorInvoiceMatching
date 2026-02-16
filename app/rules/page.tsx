import { createClient } from '@/lib/supabase/server'
import { RulesContainer } from '@/components/rules/rules-container'

export const dynamic = 'force-dynamic'

export default async function RulesPage() {
    const supabase = await createClient()

    // Fetch actual rules from DB
    let { data: rules } = await supabase
        .from('validator_rules')
        .select('*')
        .order('created_at', { ascending: false })

    // POC Fallback: If DB is empty, provide nice starting examples
    const displayRules = (rules && rules.length > 0) ? rules : [
        {
            id: '1',
            name: 'TechParts Auto-Approve',
            condition_field: 'vendor_name',
            operator: 'equals',
            value: 'TechParts Ltd',
            action: 'auto_approve',
            is_active: true
        },
        {
            id: '2',
            name: 'High Value Threshold',
            condition_field: 'total_amount',
            operator: 'greater_than',
            value: '5000',
            action: 'flag_review',
            is_active: true
        }
    ]

    return <RulesContainer initialRules={displayRules} />
}
