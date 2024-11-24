export interface FeeStructure {
    original_price?: number;
    discounted_price?: number;
}

export interface Duration {
    india?: string;
    usa?: string;
}

export interface EligibilityCriteria {
    required_tests?: string[];
    scholarship_info?: string;
    duration?: Duration;
    fee_structure?: FeeStructure;
}

export interface Program {
    program_name: string;
    specializations?: string[];
    eligibility_criteria?: EligibilityCriteria;
}

export interface University {
    programId?: number;
    universityId?: number;
    name?: string;
    location?: string;
    programs?: Program[];
}
