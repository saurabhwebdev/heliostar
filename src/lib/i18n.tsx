"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "es";

type Dict = Record<Lang, Record<string, string>>;

const dict: Dict = {
  en: {
    // Navbar
    nav_profile: "Profile",
    nav_settings: "Settings",
    nav_logout: "Logout",
    nav_settings_coming: "Settings coming soon",
    nav_signed_out: "Signed out",
    nav_go_dashboard: "Go to dashboard",
    nav_language: "Language",

    // Dashboard landing
    app_title: "Health and Safety Application",
    app_subtitle: "Quick access to core modules",
    mod_report_incident: "Report Incident",
    mod_capa: "CAPA",
    mod_ias: "IAS",
    mod_carpeta: "Carpeta Supervisor",
    mod_procedimientos: "Procedimientos",
    mod_platicas: "Platicas 5 mins",
    mod_templates: "Standard Templates",
    mod_analytics: "Analytics",

    // Report Incident
    ri_title: "Report Incident",
    ri_subtitle: "Fill the form to register an incident",
    ri_incident_details: "Incident Details",
    ri_site: "Site",
    ri_date: "Date",
    ri_time: "Time",
    ri_incident_area: "Incident Area",
    ri_incident_category: "Incident Category",
    ri_shift: "Shift",
    ri_severity: "Severity",
    ri_personnel_type: "Personnel Type",
    ri_injury_area: "Injury Area",
    ri_operational_category: "Operational Category",
    ri_description_section: "INCIDENT DESCRIPTION",
    ri_description: "Description",
    ri_submit: "Submit Report",
    ri_reset: "Reset",
    ri_risk_calc: "Risk Calculator",
    placeholder_select: "Select",
    placeholder_find_items: "Find items",
    placeholder_select_site: "Select site",
    placeholder_select_area: "Select area",
    placeholder_select_category: "Select category",
    placeholder_select_shift: "Select shift",
    placeholder_select_severity: "Select severity",
    placeholder_select_type: "Select type",
    placeholder_select_body_area: "Select body area",

    // Risk calculator shared
    rc_title: "Risk Calculator",
    rc_desc: "Select the factors to estimate risk.",
    rc_likelihood: "Likelihood",
    rc_result: "Result",
    rc_exposure: "Exposure",
    rc_unlikely: "Unlikely",
    rc_possible: "Possible",
    rc_likely: "Likely",
    rc_very_likely: "Very likely",
    rc_almost_certain: "Almost certain",
    rc_first_aid: "First Aid",
    rc_medical_treatment: "Medical treatment",
    rc_serious_lti: "Serious (LTI)",
    rc_disability: "Disability",
    rc_fatality: "Fatality",
    rc_multiple_fatalities: "Multiple Fatalities",
    rc_hasnt_happened: "Hasn't happened",
    rc_rarely: "Rarely",
    rc_sometimes: "Sometimes",
    rc_often: "Often",
    rc_very_often: "Very often",
    rc_constant: "Constant",
    rc_score: "Computed Risk Score",
    rc_recommendation: "Recommendation",
    rc_clear: "Clear",
    rc_close: "Close",

    // Common option labels
    site_plant_a: "Plant A",
    site_plant_b: "Plant B",
    site_warehouse: "Warehouse",
    site_office: "Office",

    area_production: "Production",
    area_maintenance: "Maintenance",
    area_warehouse: "Warehouse",
    area_office: "Office",
    area_outdoors: "Outdoors",

    cat_near_miss: "Near Miss",
    cat_first_aid: "First Aid",
    cat_medical: "Medical Treatment",
    cat_lost_time: "Lost Time",
    cat_property_damage: "Property Damage",

    shift_morning: "Morning",
    shift_afternoon: "Afternoon",
    shift_night: "Night",

    severity_low: "Low",
    severity_medium: "Medium",
    severity_high: "High",
    severity_critical: "Critical",

    person_employee: "Employee",
    person_contractor: "Contractor",
    person_visitor: "Visitor",

    inj_head: "Head",
    inj_hand: "Hand",
    inj_arm: "Arm",
    inj_leg: "Leg",
    inj_back: "Back",
    inj_other: "Other",

    op_mechanical: "Mechanical",
    op_electrical: "Electrical",
    op_chemical: "Chemical",
    op_ergonomic: "Ergonomic",
    op_safety: "Safety",
    op_environmental: "Environmental",

    // CAPA
    capa_title: "CAPA",
    capa_subtitle: "Create corrective and preventive actions for reported incidents.",
    capa_go_ri: "Go to Report Incident",
    capa_incident: "Incident",
    capa_incident_details: "Incident Details",
    capa_assigned_to: "Assigned To",
    capa_incident_cost: "Incident Cost",
    capa_currency: "Currency",
    capa_description_section: "INCIDENT DESCRIPTION",
    capa_action_section: "ACTION TAKEN",
    capa_submit: "Submit CAPA",

    // IAS
    ias_title: "IAS",
    ias_date: "Date",
    ias_time: "Time",
    ias_observed: "Observed",
    ias_weighted: "Weighted",
    ias_people_safe: "People observed not committing unsafe acts",
    ias_area: "Area",
    ias_category: "Categoría",
    ias_total: "Total",
    ias_desc_insegura: "DESCRIPCIÓN DE LA CONDUCTA INSEGURA",
    ias_comments: "COMENTARIOS",
    ias_submit: "Submit",
    ias_reset: "Reset",
    ias_response: "Response",
    ias_risk_assessment: "Risk Assessment",
    ias_legend: "Desempeño",
    ias_safe: "% Safe",
    ias_warning: "% Warning",
    ias_risk: "% Risk",

    // IAS response page
    ias_responsible: "Responsible",
    ias_due_date: "Due Date",
    ias_escalation: "Escalation",

    // Roles & escalation
    role_supervisor: "Supervisor",
    role_manager: "Manager",
    role_hse: "HSE",
    role_operator: "Operator",

    esc_none: "None",
    esc_low: "Low",
    esc_medium: "Medium",
    esc_high: "High",

    // Toasts
    toast_ias_saved: "IAS saved (ui-only demo)",
    toast_response_saved: "Response saved (ui-only demo)",

    // Dashboard tooltips
    tip_mod_report_incident: "Create and submit an incident report",
    tip_mod_capa: "Track corrective and preventive actions",
    tip_mod_ias: "Incident analysis and audits",
    tip_mod_carpeta: "Supervisor resources and files",
    tip_mod_procedimientos: "Procedures and SOPs",
    tip_mod_platicas: "Short safety talks and guidance",
    tip_mod_templates: "Standardized templates and forms",
    tip_mod_analytics: "KPIs, trends, and dashboards",
  },
  es: {
    // Navbar
    nav_profile: "Perfil",
    nav_settings: "Ajustes",
    nav_logout: "Cerrar sesión",
    nav_settings_coming: "Ajustes próximamente",
    nav_signed_out: "Sesión cerrada",
    nav_go_dashboard: "Ir al panel",
    nav_language: "Idioma",

    // Dashboard landing
    app_title: "Aplicación de Salud y Seguridad",
    app_subtitle: "Acceso rápido a módulos clave",
    mod_report_incident: "Reportar Incidente",
    mod_capa: "CAPA",
    mod_ias: "IAS",
    mod_carpeta: "Carpeta Supervisor",
    mod_procedimientos: "Procedimientos",
    mod_platicas: "Pláticas 5 mins",
    mod_templates: "Plantillas Estándar",
    mod_analytics: "Analítica",

    // Report Incident
    ri_title: "Reportar Incidente",
    ri_subtitle: "Complete el formulario para registrar un incidente",
    ri_incident_details: "Detalles del Incidente",
    ri_site: "Sitio",
    ri_date: "Fecha",
    ri_time: "Hora",
    ri_incident_area: "Área del Incidente",
    ri_incident_category: "Categoría del Incidente",
    ri_shift: "Turno",
    ri_severity: "Severidad",
    ri_personnel_type: "Tipo de Personal",
    ri_injury_area: "Área de Lesión",
    ri_operational_category: "Categoría Operativa",
    ri_description_section: "DESCRIPCIÓN DEL INCIDENTE",
    ri_description: "Descripción",
    ri_submit: "Enviar Reporte",
    ri_reset: "Reiniciar",
    ri_risk_calc: "Calculadora de Riesgo",
    placeholder_select: "Seleccionar",
    placeholder_find_items: "Buscar ítems",
    placeholder_select_site: "Seleccionar sitio",
    placeholder_select_area: "Seleccionar área",
    placeholder_select_category: "Seleccionar categoría",
    placeholder_select_shift: "Seleccionar turno",
    placeholder_select_severity: "Seleccionar severidad",
    placeholder_select_type: "Seleccionar tipo",
    placeholder_select_body_area: "Seleccionar área del cuerpo",

    // Risk calculator shared
    rc_title: "Calculadora de Riesgo",
    rc_desc: "Seleccione los factores para estimar el riesgo.",
    rc_likelihood: "Probabilidad",
    rc_result: "Resultado",
    rc_exposure: "Exposición",
    rc_unlikely: "Improbable",
    rc_possible: "Posible",
    rc_likely: "Probable",
    rc_very_likely: "Muy probable",
    rc_almost_certain: "Casi seguro",
    rc_first_aid: "Primeros auxilios",
    rc_medical_treatment: "Tratamiento médico",
    rc_serious_lti: "Grave (LTI)",
    rc_disability: "Discapacidad",
    rc_fatality: "Fatalidad",
    rc_multiple_fatalities: "Múltiples fatalidades",
    rc_hasnt_happened: "No ha ocurrido",
    rc_rarely: "Raramente",
    rc_sometimes: "A veces",
    rc_often: "A menudo",
    rc_very_often: "Muy a menudo",
    rc_constant: "Constante",
    rc_score: "Puntaje de Riesgo",
    rc_recommendation: "Recomendación",
    rc_clear: "Limpiar",
    rc_close: "Cerrar",

    // Common option labels
    site_plant_a: "Planta A",
    site_plant_b: "Planta B",
    site_warehouse: "Almacén",
    site_office: "Oficina",

    area_production: "Producción",
    area_maintenance: "Mantenimiento",
    area_warehouse: "Almacén",
    area_office: "Oficina",
    area_outdoors: "Exterior",

    cat_near_miss: "Cuasi accidente",
    cat_first_aid: "Primeros auxilios",
    cat_medical: "Tratamiento médico",
    cat_lost_time: "Tiempo perdido",
    cat_property_damage: "Daños a la propiedad",

    shift_morning: "Mañana",
    shift_afternoon: "Tarde",
    shift_night: "Noche",

    severity_low: "Baja",
    severity_medium: "Media",
    severity_high: "Alta",
    severity_critical: "Crítica",

    person_employee: "Empleado",
    person_contractor: "Contratista",
    person_visitor: "Visitante",

    inj_head: "Cabeza",
    inj_hand: "Mano",
    inj_arm: "Brazo",
    inj_leg: "Pierna",
    inj_back: "Espalda",
    inj_other: "Otra",

    op_mechanical: "Mecánica",
    op_electrical: "Eléctrica",
    op_chemical: "Química",
    op_ergonomic: "Ergonómica",
    op_safety: "Seguridad",
    op_environmental: "Ambiental",

    // CAPA
    capa_title: "CAPA",
    capa_subtitle: "Cree acciones correctivas y preventivas para incidentes reportados.",
    capa_go_ri: "Ir a Reportar Incidente",
    capa_incident: "Incidente",
    capa_incident_details: "Detalles del Incidente",
    capa_assigned_to: "Asignado a",
    capa_incident_cost: "Costo del Incidente",
    capa_currency: "Moneda",
    capa_description_section: "DESCRIPCIÓN DEL INCIDENTE",
    capa_action_section: "ACCIÓN TOMADA",
    capa_submit: "Guardar CAPA",

    // IAS
    ias_title: "IAS",
    ias_date: "Fecha",
    ias_time: "Hora",
    ias_observed: "Observado",
    ias_weighted: "Ponderado",
    ias_people_safe: "Personas observadas sin actos inseguros",
    ias_area: "Área",
    ias_category: "Categoría",
    ias_total: "Total",
    ias_desc_insegura: "DESCRIPCIÓN DE LA CONDUCTA INSEGURA",
    ias_comments: "COMENTARIOS",
    ias_submit: "Enviar",
    ias_reset: "Reiniciar",
    ias_response: "Respuesta",
    ias_risk_assessment: "Evaluación de Riesgo",
    ias_legend: "Desempeño",
    ias_safe: "% Seguro",
    ias_warning: "% Advertencia",
    ias_risk: "% Riesgo",

    // IAS response page
    ias_responsible: "Responsable",
    ias_due_date: "Fecha límite",
    ias_escalation: "Escalamiento",

    // Roles & escalation
    role_supervisor: "Supervisor",
    role_manager: "Gerente",
    role_hse: "HSE",
    role_operator: "Operador",

    esc_none: "Ninguno",
    esc_low: "Bajo",
    esc_medium: "Medio",
    esc_high: "Alto",

    // Toasts
    toast_ias_saved: "IAS guardado (solo interfaz demo)",
    toast_response_saved: "Respuesta guardada (solo interfaz demo)",

    // Dashboard tooltips
    tip_mod_report_incident: "Crear y enviar un reporte de incidente",
    tip_mod_capa: "Gestionar acciones correctivas y preventivas",
    tip_mod_ias: "Análisis e inspecciones de incidentes",
    tip_mod_carpeta: "Recursos y archivos del supervisor",
    tip_mod_procedimientos: "Procedimientos y SOPs",
    tip_mod_platicas: "Pláticas de seguridad breves",
    tip_mod_templates: "Plantillas estandarizadas",
    tip_mod_analytics: "KPIs, tendencias y tableros",
  },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (saved === "en" || saved === "es") setLang(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("lang", lang);
    // set html lang
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => {
    return (key: string) => dict[lang][key] ?? dict.en[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
